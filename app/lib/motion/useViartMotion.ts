'use client';

/**
 * The one place the site's motion is started, coordinated and torn down.
 *
 * Layering:
 *   tokens.ts   the shared vocabulary (easing, duration, distance, budgets)
 *   scenes.ts   hand-built pinned sequences — rare, expensive, above the fold
 *   reveal.ts   declarative `data-reveal` entrances — everything else
 *   this file   the driver: one Lenis, one ticker, one matchMedia, one context
 *
 * Why a single driver: two smooth-scroll instances, or a scene built outside
 * the shared gsap.context, is the usual cause of "the animation works until you
 * resize / navigate / come back to the tab".
 */

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { HEADER_OFFSET } from './tokens';
import { createEntranceReveals, createMaskReveals, revealInstantly } from './reveal';
import { createCapsulesScene, createHeureBleueScene, createJourneyScene } from './scenes';

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * A phone's address bar sliding away changes `window.innerHeight` without a
 * single pixel of layout changing — the scenes are sized in `svh`, which does
 * not follow the chrome. Left alone, ScrollTrigger treats that as a resize,
 * refreshes every trigger, re-measures four pins and restores the scroll
 * position against the new numbers: the page jumps mid-flick, every time the
 * bar appears or disappears. `ignoreMobileResize` makes ScrollTrigger ignore a
 * height-only change on touch devices, which is exactly what this is.
 */
ScrollTrigger.config({ ignoreMobileResize: true });

// Client components are pre-rendered on the server, where useLayoutEffect warns.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

type MotionRefs = {
  /** Wrapper around the cinematic hero scene. */
  sequence: React.RefObject<HTMLDivElement | null>;
  /** Everything below the scene — the declarative reveal scope. */
  page: React.RefObject<HTMLElement | null>;
};

export function useViartMotion({ sequence, page }: MotionRefs) {
  const lenisRef = useRef<Lenis | null>(null);

  useIsomorphicLayoutEffect(() => {
    const sequenceRoot = sequence.current;
    const pageRoot = page.current;
    if (!sequenceRoot || !pageRoot) return;

    // --- scroll driver -----------------------------------------------------
    // `anchors` hands every in-page link to Lenis, so `#pricing` lands at the
    // right offset instead of the native jump fighting the smooth position.
    // Lenis honours prefers-reduced-motion internally and disables smoothing.
    const lenis = new Lenis({ anchors: { offset: -HEADER_OFFSET } });
    lenisRef.current = lenis;

    const onTick = (time: number) => lenis.raf(time * 1000);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    let cancelled = false;
    const media = gsap.matchMedia();
    const QUERIES = {
      motionOk: '(prefers-reduced-motion: no-preference)',
      motionReduced: '(prefers-reduced-motion: reduce)',
    };
    type Conditions = { motionOk: boolean; motionReduced: boolean };

    // --- phase 1: entrances, before the first paint ------------------------
    // Hiding a reveal target has to happen in the same frame its markup lands.
    // Deferring this to a promise makes the section appear, disappear and fade
    // back in, which reads as a glitch rather than an animation.
    media.add(QUERIES, (context) => {
      const { motionReduced } = context.conditions as Conditions;
      if (motionReduced) {
        // No triggers at all: the page is simply present. The scene markup
        // still renders as a static composition through its CSS defaults.
        revealInstantly(pageRoot);
        return;
      }
      createEntranceReveals(pageRoot);
    });

    // --- phase 2: scenes and text splitting, once fonts settle -------------
    // Both measure text or layout, and both are below the first screen, so the
    // wait costs nothing visually.
    document.fonts.ready.then(() => {
      if (cancelled) return;

      media.add(QUERIES, (context) => {
        const { motionReduced } = context.conditions as Conditions;
        if (motionReduced) return;

        createHeureBleueScene(sequenceRoot);
        createMaskReveals(pageRoot);

        // The chapter scenes, in document order. Each is scoped to the page
        // root and returns a teardown for whatever this context cannot revert
        // by itself — a rAF loop, injected DOM, a SplitText, a plain listener.
        // Everything they build with GSAP is recorded here, so the pins and
        // their spacers go away with the context.
        const teardowns = [
          createCapsulesScene(pageRoot, lenis),
          createJourneyScene(pageRoot),
        ].filter((teardown): teardown is () => void => typeof teardown === 'function');

        return () => teardowns.forEach((teardown) => teardown());
      });

      // Late-loading images change every trigger's start/end. The eager ones
      // decode just after hydration, which is what puts a scene's start
      // position a few hundred pixels off on a cold load.
      //
      // Only the eager ones. Waiting for the *last* image on the page meant
      // waiting for something a screen and a half below the reader, so the one
      // refresh this was supposed to spend on settling the first screen landed
      // instead in the middle of a scroll through the pinned chapters — and a
      // single image that never resolves (a 404, a stalled connection) stranded
      // the counter and bought no refresh at all. `refresh(true)` is the
      // debounced form, so a burst of decodes still costs one pass.
      const images = Array.from(document.images).filter(
        (image) => !image.complete && image.loading !== 'lazy',
      );
      if (images.length) {
        const onSettled = () => {
          if (!cancelled) ScrollTrigger.refresh(true);
        };
        images.forEach((image) => {
          image.addEventListener('load', onSettled, { once: true });
          image.addEventListener('error', onSettled, { once: true });
        });
      }

      ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      media.revert();
      gsap.ticker.remove(onTick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [sequence, page]);

  /**
   * Programmatic scrolling must go through Lenis for the same reason anchors
   * do — `scrollIntoView({ behavior: 'smooth' })` and Lenis animate the same
   * scroll position against each other and the page stutters or stops short.
   */
  const scrollTo = useCallback((selector: string) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(selector, { offset: -HEADER_OFFSET });
      return;
    }
    document.querySelector(selector)?.scrollIntoView({ block: 'start' });
  }, []);

  /**
   * Re-measure every trigger after the page's own content has changed height.
   *
   * The scenes below a section that grows or shrinks keep the start/end they
   * were built with — the price list swapping between a twenty-one-row category
   * and a four-row one moves everything under it by hundreds of pixels, and the
   * pins would fire against the document as it used to be. `refresh(true)` is
   * the debounced form, so several changes in one frame still cost one pass.
   */
  const refresh = useCallback(() => {
    ScrollTrigger.refresh(true);
  }, []);

  /**
   * Locking the page while the mobile menu is open. `overflow: hidden` on the
   * body does not stop Lenis — it drives scroll itself, so the menu overlay
   * would sit still while the page kept moving underneath it.
   */
  const setScrollLocked = useCallback((locked: boolean) => {
    const lenis = lenisRef.current;
    if (locked) lenis?.stop();
    else lenis?.start();
    document.body.style.overflow = locked ? 'hidden' : '';
  }, []);

  return { scrollTo, setScrollLocked, refresh };
}
