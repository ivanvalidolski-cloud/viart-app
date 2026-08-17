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
 * — a second copy would mean a second `<video>` element for the same file.
 *
 * The width gate is **not** taken here. `.grow-container` gets its
 * `translateY(-105%) scale(0.25)` from a `@media (min-width: 900px)` block, and
 * this rig is the only thing that animates it back to full size; if the two
 * gates ever disagree the plate stays a quarter-size sliver floating over the
 * gallery above it. `window.innerWidth` includes the classic scrollbar and the
 * media query does not, so they disagree by ~15px around the breakpoint — and a
 * gate read once at build time cannot notice a resize across it at all. The
 * driver runs this scene inside a `gsap.matchMedia` condition carrying the same
 * query as the stylesheet, so there is exactly one gate and it is live.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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

  const container = section.querySelector<HTMLElement>('.grow-container');
  const titleRow = section.querySelector<HTMLElement>('.grow-title');
  const titleParts = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('.grow-title p'));
  if (!container || !titleRow || !titleParts.length) return;

  // The caption's row is the one box in this rig whose *layout* height follows
  // the animation: 80px of type settling to 20px takes about seventy pixels of
  // document height with it, so every section below the video creeps upward for
  // the whole length of the scrub — a scroll position that quietly means
  // something different at the end of the scene than it did at the start.
  //
  // Locking the row to its settled height fixes that without moving anything:
  // the row is the container's last child and its content is top-aligned, so
  // the oversized early type simply overhangs the box it no longer sizes, in
  // the section's own bottom padding, at a quarter scale, above the fold.
  titleParts.forEach((part) => {
    part.style.fontSize = `${VIDEO_GROW.fontTo}px`;
  });
  titleRow.style.height = `${titleRow.offsetHeight}px`;

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

  // --- the write pass -------------------------------------------------------
  // `gap` and `font-size` are layout properties: writing them re-lays out this
  // section and moves every section under it, so the document height itself
  // wobbles while the plate grows. Writing them on a frame where they have not
  // changed pays that cost for nothing, which is what an unconditional rAF loop
  // does forever — including while the scene is nowhere near the screen.
  let lastTransform = '';
  let lastGap = '';
  let lastFontSize = '';

  const write = () => {
    const scaledMultiplier = (1 - state.scale) * state.movementMultiplier;
    const target =
      state.scale < VIDEO_GROW.parallaxCutoff ? state.targetMouseX * scaledMultiplier : 0;
    state.currentMouseX = gsap.utils.interpolate(
      state.currentMouseX,
      target,
      VIDEO_GROW.mouseLerp,
    );

    const transform = `translateY(${state.currentTranslateY.toFixed(3)}%) translateX(${state.currentMouseX.toFixed(2)}px) scale(${state.scale.toFixed(4)})`;
    if (transform !== lastTransform) {
      lastTransform = transform;
      container.style.transform = transform;
    }

    const gap = `${state.gap.toFixed(3)}em`;
    if (gap !== lastGap) {
      lastGap = gap;
      container.style.gap = gap;
    }

    // Quantised to whole pixels: the interpolated value changes every frame,
    // the rendered glyph box does not.
    const fontSize = `${Math.round(state.fontSize)}px`;
    if (fontSize !== lastFontSize) {
      lastFontSize = fontSize;
      titleParts.forEach((part) => {
        part.style.fontSize = fontSize;
      });
    }
  };

  // The rig only runs while its section is on screen. Frames nobody can see are
  // the only thing this skips — the scroll state is still tracked by the
  // trigger above, and re-entering writes the current state on the next frame.
  let frame = 0;
  const animate = () => {
    write();
    frame = requestAnimationFrame(animate);
  };

  const stop = () => {
    if (!frame) return;
    cancelAnimationFrame(frame);
    frame = 0;
  };

  const startLoop = () => {
    if (frame) return;
    frame = requestAnimationFrame(animate);
  };

  write();

  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: ({ isActive }) => (isActive ? startLoop() : stop()),
  });

  // The rAF loop, the two listeners and the inline styles the loop wrote are all
  // outside what the context records.
  return () => {
    stop();
    document.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('resize', onResize);
    container.style.removeProperty('transform');
    container.style.removeProperty('gap');
    titleRow.style.removeProperty('height');
    titleParts.forEach((part) => part.style.removeProperty('font-size'));
  };
}
