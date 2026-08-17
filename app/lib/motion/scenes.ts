/**
 * Cinematic scenes — the hand-built, pinned/scrubbed sequences.
 *
 * Rules that keep scenes from fighting each other and the rest of the page:
 *  - A scene owns every element inside it. No `data-reveal` may appear within
 *    a scene's DOM, or the two layers animate the same node.
 *  - Only one scene may be pinned at a time, and scenes live above the fold.
 *    Their scroll budget comes from SCENE tokens, never from a literal.
 *  - Every trigger declares `invalidateOnRefresh` so distances recompute on
 *    resize, font swap and late image loads instead of going stale.
 *  - Per-frame callbacks never read layout (`innerWidth`/`innerHeight`) — those
 *    are cached on refresh. Reading them per frame forces a reflow each tick.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { EASE, SCENE } from './tokens';

const clamp = gsap.utils.clamp(0, 1);
const interpolate = gsap.utils.interpolate;

/**
 * Scene 01 — "heure bleue": the image wall zooms toward the viewer while the
 * focal frame settles, handing off to the intro copy.
 */
export function createHeureBleueScene(root: HTMLElement) {
  const gallery = root.querySelector<HTMLElement>('.hb-gallery');
  const sideColumns = gsap.utils.toArray<HTMLElement>(
    root.querySelectorAll('.hb-col:not(.hb-col--main)'),
  );
  const focalImage = root.querySelector<HTMLElement>('.hb-img--main img');
  const trigger = root.querySelector<HTMLElement>('.hb-ws');
  if (!gallery || !focalImage || !trigger) return;

  // GSAP owns the transform from here on; the centring lives in the transform
  // it writes, so the CSS `translate(-50%, -50%)` fallback is not fought over.
  gsap.set(gallery, { xPercent: -50, yPercent: -50 });

  const setGalleryScale = gsap.quickSetter(gallery, 'scale') as (value: number) => void;
  const setFocalScale = gsap.quickSetter(focalImage, 'scale') as (value: number) => void;
  const setColumnY = sideColumns.map(
    (column) => gsap.quickSetter(column, 'y', 'px') as (value: number) => void,
  );

  // Cached on refresh instead of read per frame.
  let zoomCeiling: number = SCENE.zoomDesktop;

  ScrollTrigger.create({
    trigger,
    start: 'top bottom',
    end: 'bottom bottom',
    scrub: SCENE.scrub,
    invalidateOnRefresh: true,
    onRefresh: () => {
      zoomCeiling =
        window.innerWidth < SCENE.mobileBreakpoint ? SCENE.zoomMobile : SCENE.zoomDesktop;
    },
    onUpdate: ({ progress }) => {
      setGalleryScale(1 + progress * zoomCeiling);
      setFocalScale(2 - progress * 0.85);
      const columnTravel = progress * 300;
      setColumnY.forEach((set) => set(columnTravel));
    },
  });
}

/**
 * Scene 02 — "voyeur": a pinned four-phase sequence.
 *   0.00–0.25  the frame narrows to a vertical slit, the ground darkens
 *   0.25–0.45  the slit rotates
 *   0.45–0.65  it collapses to nothing while the copy behind slides apart
 *   0.65–0.85  two outro images wipe in from top and bottom
 *   0.90       the outro headline rises line by line
 */
export function createVoyeurScene(scene: HTMLElement) {
  const fgContent = scene.querySelector<HTMLElement>('.vv-fg-content');
  const fgOverlayDark = scene.querySelector<HTMLElement>('.vv-fg-overlay-dark');
  const fgOverlayAccent = scene.querySelector<HTMLElement>('.vv-fg-overlay-accent');
  const bgCopies = gsap.utils.toArray<HTMLElement>(scene.querySelectorAll('.vv-bg-copy'));
  const outroImages = gsap.utils.toArray<HTMLElement>(scene.querySelectorAll('.vv-outro-img'));
  const outroHeadline = scene.querySelector<HTMLElement>('.vv-outro-header h3');

  if (
    !fgContent || !fgOverlayDark || !fgOverlayAccent
    || bgCopies.length < 2 || outroImages.length < 2 || !outroHeadline
  ) return;

  // autoSplit re-measures the headline whenever the line box changes — a resize
  // or a late font swap would otherwise leave the mask cutting mid-glyph.
  // Both flags are declared before the split: onSplit runs synchronously.
  let lines: Element[] = [];
  let linesRevealed = false;

  SplitText.create(outroHeadline, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'vv-line',
    autoSplit: true,
    onSplit: (self) => {
      lines = self.lines;
      // Re-splitting resets inline styles, so the hidden state is reapplied
      // here rather than once at setup.
      gsap.set(lines, { yPercent: linesRevealed ? 0 : 100 });
    },
  });

  ScrollTrigger.create({
    trigger: scene,
    start: 'top top',
    // A function end recomputes on refresh; a literal would freeze the pin
    // distance at the height the page happened to have on first load — the
    // reason the scene drifted after a mobile browser-chrome resize.
    end: () => `+=${window.innerHeight * SCENE.voyeurViewports}`,
    pin: true,
    pinSpacing: true,
    scrub: SCENE.scrub,
    invalidateOnRefresh: true,
    anticipatePin: 1,
    onUpdate: ({ progress }) => {
      const slit = clamp(progress / 0.25);
      const left = interpolate(0, 48, slit);
      const right = interpolate(100, 52, slit);
      gsap.set(fgContent, {
        clipPath: `polygon(${left}% 0%, ${right}% 0%, ${right}% 100%, ${left}% 100%)`,
      });
      gsap.set(fgOverlayDark, { opacity: slit });

      const rotation = clamp((progress - 0.25) / 0.2);
      gsap.set(fgContent, { rotate: interpolate(0, 65, rotation) });

      const collapse = clamp((progress - 0.45) / 0.2);
      gsap.set(fgContent, { scale: interpolate(1, 0, collapse) });
      gsap.set(bgCopies[0], { xPercent: interpolate(0, 100, collapse) });
      gsap.set(bgCopies[1], { xPercent: interpolate(0, -100, collapse) });
      gsap.set(fgOverlayAccent, { opacity: clamp((progress - 0.45) / 0.05) });

      const wipe = clamp((progress - 0.65) / 0.2);
      const topEdge = interpolate(0, 100, wipe);
      const bottomEdge = interpolate(100, 0, wipe);
      gsap.set(outroImages[0], {
        clipPath: `polygon(0% 0%, 100% 0%, 100% ${topEdge}%, 0% ${topEdge}%)`,
      });
      gsap.set(outroImages[1], {
        clipPath: `polygon(0% ${bottomEdge}%, 100% ${bottomEdge}%, 100% 100%, 0% 100%)`,
      });

      if (progress >= 0.9 && !linesRevealed) {
        linesRevealed = true;
        gsap.to(lines, { yPercent: 0, duration: 0.75, stagger: 0.1, ease: EASE.out });
      } else if (progress < 0.9 && linesRevealed) {
        linesRevealed = false;
        gsap.to(lines, { yPercent: 100, duration: 0.25, stagger: -0.05, ease: EASE.out });
      }
    },
  });
}
