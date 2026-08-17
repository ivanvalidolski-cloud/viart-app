/**
 * Scene 06 — the master video grows into place (`#video`).
 *
 * Adapted from "Scroll-Grow Showreel Video Reveal (Scrub + Mouse Parallax)"
 * https://motionprompts.dev/component/vucko-scroll-animation-javascript/
 *
 * A quarter-scale plate pulled up above its own section grows into a full-width
 * 16:9 frame as the section scrolls in. The ScrollTrigger animates nothing
 * directly: its `onUpdate` interpolates values into one shared state object,
 * and a rAF loop writes them as a transform string, adding a lerped horizontal
 * mouse parallax whose strength is proportional to how small the plate still is
 * and which dies to nothing as it reaches full size.
 *
 * The breakpoint table, the `0.25 → 1` scale, the `2em → 1em` gap, the two-phase
 * title size, the `0.05` lerp, the `scale ≥ 0.95` cutoff and the exact
 * `translateY(%) translateX(px) scale()` order are the source's.
 *
 * Adapted: one container instead of the source's duplicated desktop/mobile pair
 * — a second copy would mean a second `<video>` element for the same file. The
 * width gate is unchanged and taken once, synchronously: below it nothing is
 * built and the plate is a plain static block in flow.
 */

import gsap from 'gsap';
import { VIDEO_GROW } from '../tokens';

/** First match wins; wider than the last entry uses the fallback. */
const BREAKPOINTS = [
  { maxWidth: 1000, translateY: -135, movementMultiplier: 450 },
  { maxWidth: 1100, translateY: -130, movementMultiplier: 500 },
  { maxWidth: 1200, translateY: -125, movementMultiplier: 550 },
  { maxWidth: 1300, translateY: -120, movementMultiplier: 600 },
];

const WIDEST = { translateY: -105, movementMultiplier: 650 };

const initialValues = () =>
  BREAKPOINTS.find((entry) => window.innerWidth < entry.maxWidth) ?? WIDEST;

export function createVideoGrowScene(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>('.grow-scene');
  if (!section) return;
  if (window.innerWidth < VIDEO_GROW.minWidth) return;

  const container = section.querySelector<HTMLElement>('.grow-container');
  const titleParts = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('.grow-title p'));
  if (!container || !titleParts.length) return;

  const start = initialValues();

  // Every field is written to on scroll, so the tokens' literal types must not
  // narrow them.
  const state: Record<
    | 'scrollProgress'
    | 'initialTranslateY'
    | 'currentTranslateY'
    | 'movementMultiplier'
    | 'scale'
    | 'fontSize'
    | 'gap'
    | 'targetMouseX'
    | 'currentMouseX',
    number
  > = {
    scrollProgress: 0,
    initialTranslateY: start.translateY,
    currentTranslateY: start.translateY,
    movementMultiplier: start.movementMultiplier,
    scale: VIDEO_GROW.scaleFrom,
    fontSize: VIDEO_GROW.fontFrom,
    gap: VIDEO_GROW.gapFrom,
    targetMouseX: 0,
    currentMouseX: 0,
  };

  gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top bottom',
      end: 'top 10%',
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: ({ progress }) => {
        state.scrollProgress = progress;
        state.currentTranslateY = gsap.utils.interpolate(state.initialTranslateY, 0, progress);
        state.scale = gsap.utils.interpolate(VIDEO_GROW.scaleFrom, 1, progress);
        state.gap = gsap.utils.interpolate(VIDEO_GROW.gapFrom, VIDEO_GROW.gapTo, progress);

        // Fast shrink early, slow settle late: by full scale the title reads as
        // an ordinary caption rather than a display line.
        if (progress <= VIDEO_GROW.fontSplit) {
          state.fontSize = gsap.utils.interpolate(
            VIDEO_GROW.fontFrom,
            VIDEO_GROW.fontMid,
            progress / VIDEO_GROW.fontSplit,
          );
        } else {
          state.fontSize = gsap.utils.interpolate(
            VIDEO_GROW.fontMid,
            VIDEO_GROW.fontTo,
            (progress - VIDEO_GROW.fontSplit) / (1 - VIDEO_GROW.fontSplit),
          );
        }
      },
    },
  });

  const onMouseMove = (event: MouseEvent) => {
    state.targetMouseX = (event.clientX / window.innerWidth - 0.5) * 2;
  };

  const onResize = () => {
    const next = initialValues();
    state.initialTranslateY = next.translateY;
    state.movementMultiplier = next.movementMultiplier;
    // Never snap the plate mid-scroll — only a fresh, unscrolled rig re-homes.
    if (state.scrollProgress === 0) state.currentTranslateY = next.translateY;
  };

  document.addEventListener('mousemove', onMouseMove);
  window.addEventListener('resize', onResize);

  let frame = 0;
  const animate = () => {
    const scaledMultiplier = (1 - state.scale) * state.movementMultiplier;
    const target =
      state.scale < VIDEO_GROW.parallaxCutoff ? state.targetMouseX * scaledMultiplier : 0;
    state.currentMouseX = gsap.utils.interpolate(
      state.currentMouseX,
      target,
      VIDEO_GROW.mouseLerp,
    );

    container.style.transform = `translateY(${state.currentTranslateY}%) translateX(${state.currentMouseX}px) scale(${state.scale})`;
    container.style.gap = `${state.gap}em`;
    titleParts.forEach((part) => {
      part.style.fontSize = `${state.fontSize}px`;
    });

    frame = requestAnimationFrame(animate);
  };
  animate();

  // The rAF loop, the two listeners and the inline styles the loop wrote are all
  // outside what the context records.
  return () => {
    cancelAnimationFrame(frame);
    document.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('resize', onResize);
    container.style.removeProperty('transform');
    container.style.removeProperty('gap');
    titleParts.forEach((part) => part.style.removeProperty('font-size'));
  };
}
