'use client';

/**
 * Motion driver for the ABL prototype route.
 *
 * Same layering and the same vocabulary as `useViartMotion` — `tokens.ts` for
 * the numbers, `reveal.ts` for the declarative `data-reveal` entrances — but
 * without the two cinematic scenes. Those pin elements that belong to the ViART
 * home page and do not exist here; importing them would build triggers against
 * missing nodes.
 *
 * This is not a second motion system. It is the same one started for a
 * different route: one Lenis, one ticker, one matchMedia, one context, torn
 * down together. Only one of the two drivers is ever mounted at a time, because
 * only one page renders at a time.
 */

import { useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { createEntranceReveals, createMaskReveals, revealInstantly } from './reveal';

gsap.registerPlugin(ScrollTrigger, SplitText);

// Client components are pre-rendered on the server, where useLayoutEffect warns.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function useAblMotion(page: React.RefObject<HTMLElement | null>) {
  useIsomorphicLayoutEffect(() => {
    const pageRoot = page.current;
    if (!pageRoot) return;

    // The prototype has no fixed header, so anchors need no offset — but they
    // still go through Lenis, because a native jump and the smooth position
    // would animate the same value against each other.
    const lenis = new Lenis({ anchors: true });

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
    // The hidden state has to land in the same frame the markup does. The hero
    // is above the fold, which is exactly why its headline uses a plain
    // `data-reveal` and not a mask: mask reveals are built in phase 2, after
    // the webfont settles, and an above-the-fold mask would show the headline,
    // hide it, and play it back in.
    media.add(QUERIES, (context) => {
      const { motionReduced } = context.conditions as Conditions;
      if (motionReduced) {
        revealInstantly(pageRoot);
        return;
      }
      createEntranceReveals(pageRoot);
    });

    // --- phase 2: text splitting, once fonts settle ------------------------
    // Splitting against the fallback face measures the wrong line boxes and the
    // mask cuts through glyphs. Every mask target on this route is below the
    // fold, so the wait costs nothing visually.
    document.fonts.ready.then(() => {
      if (cancelled) return;

      media.add(QUERIES, (context) => {
        const { motionReduced } = context.conditions as Conditions;
        if (motionReduced) return;
        createMaskReveals(pageRoot);
      });

      // Media below the fold decodes after hydration and moves every trigger's
      // start/end, which is what puts a reveal a few hundred pixels off on a
      // cold load.
      const images = Array.from(document.images).filter((image) => !image.complete);
      let pending = images.length;
      if (pending) {
        const onSettled = () => {
          pending -= 1;
          if (pending === 0 && !cancelled) ScrollTrigger.refresh();
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
    };
  }, [page]);
}
