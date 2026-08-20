/**
 * Scene 01 — the hero → Laser signature transfer.
 *
 * Runnable behaviour reference: codrops "ImageToContent"
 * (github.com/codrops/ImageToContent) — inspected only for the mechanic: one
 * dominant image continuously changes size and position on a single scroll
 * budget and arrives at a smaller, content-position home. Nothing of that
 * demo's visual style, typography, gallery model or stack is used here; the
 * geometry below is this site's own FLIP-style rect interpolation.
 *
 * Desktop: the hero's dominant image is `position: fixed` for the whole
 * scroll budget and its `transform` is driven from a measured start rect
 * (its own hero box) to a measured end rect (Laser's media slot in the
 * Directions scene, read relative to that scene's own top — which becomes
 * the viewport top the instant its pin engages, right where this scrub
 * ends). A small sinusoidal bow rides on top of the straight-line path so
 * the move reads as authored, not mechanical — the spec explicitly allows a
 * diagonal path and asymmetric scale as a secondary character. At the very
 * end the traveling image crossfades into Laser's own resting `<Image>`
 * (same source, already laid out in Laser's normal flow) so the Directions
 * stepper below takes over a completely ordinary, non-fixed element.
 *
 * Mobile: Directions is not pinned or gesture-gated there (§12 — natural
 * vertical scroll, no desktop-style lock), so there is no fixed end rect to
 * travel to. The transfer shortens to a plain crossfade + gentle scale over
 * a shorter budget — media continuity without the spatial trick.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TRANSFER } from '../tokens';
import { quickScale } from '../setters';

type Rect = { x: number; y: number; w: number; h: number };

export function createTransferScene(root: HTMLElement, desktop: boolean) {
  const spacer = root.querySelector<HTMLElement>('.hero-transfer-spacer');
  const sourceFrame = root.querySelector<HTMLElement>('.hero-media__frame');
  const heroCopy = root.querySelector<HTMLElement>('.hero-copy');
  const directionsScene = root.querySelector<HTMLElement>('.directions-scene');
  const targetFrame = directionsScene?.querySelector<HTMLElement>('.directions-media__frame--laser');
  const laserPanel = directionsScene?.querySelector<HTMLElement>('.directions-panel--laser');

  if (!spacer || !sourceFrame || !heroCopy || !directionsScene || !targetFrame || !laserPanel) return;

  gsap.set(targetFrame, { opacity: 0 });
  gsap.set(laserPanel, { opacity: 0, y: 18 });

  const setHeroCopyOpacity = gsap.quickSetter(heroCopy, 'opacity') as (v: number) => void;
  const setHeroCopyY = gsap.quickSetter(heroCopy, 'y', 'px') as (v: number) => void;
  const setLaserPanelOpacity = gsap.quickSetter(laserPanel, 'opacity') as (v: number) => void;
  const setLaserPanelY = gsap.quickSetter(laserPanel, 'y', 'px') as (v: number) => void;
  const setTargetOpacity = gsap.quickSetter(targetFrame, 'opacity') as (v: number) => void;

  if (!desktop) {
    gsap.set(sourceFrame, { transformOrigin: '50% 50%' });
    const setSourceOpacity = gsap.quickSetter(sourceFrame, 'opacity') as (v: number) => void;
    // Not `gsap.quickSetter(el, 'scale')` — see `setters.ts`: it resolves
    // through the CSS harness's alias table, which maps `scale` to the pair
    // `"scaleX,scaleY"` and throws on every frame.
    const setSourceScale = quickScale(sourceFrame);

    ScrollTrigger.create({
      trigger: spacer,
      start: 'top top',
      end: 'bottom top',
      scrub: TRANSFER.scrub,
      invalidateOnRefresh: true,
      onUpdate: ({ progress }) => {
        setSourceOpacity(1 - progress);
        setSourceScale(1 - progress * 0.08);

        const leaveT = gsap.utils.clamp(0, 1, progress / 0.4);
        setHeroCopyOpacity(1 - leaveT);
        setHeroCopyY(-leaveT * 32);

        const settleT = gsap.utils.clamp(0, 1, (progress - 0.45) / 0.55);
        setTargetOpacity(settleT);
        setLaserPanelOpacity(settleT);
        setLaserPanelY(18 * (1 - settleT));
      },
    });

    return () => {
      gsap.set(sourceFrame, { clearProps: 'opacity,transform' });
      gsap.set([targetFrame, laserPanel, heroCopy], { clearProps: 'opacity,transform' });
    };
  }

  gsap.set(sourceFrame, {
    position: 'fixed',
    top: 0,
    left: 0,
    transformOrigin: '0px 0px',
    zIndex: 0,
  });

  // Elevated only once the hero copy has substantially left — at rest this
  // frame must stay *below* `.hero-copy` (z-index 2), not above it, or the
  // headline/CTA render invisible under a fully opaque image from frame one.
  // It only needs to rise above later chapters once it is actually
  // traveling into Laser's slot.
  let elevated = false;
  const setSourceElevation = (shouldElevate: boolean) => {
    if (shouldElevate === elevated) return;
    elevated = shouldElevate;
    sourceFrame!.style.zIndex = shouldElevate ? '40' : '0';
  };

  const setSourceX = gsap.quickSetter(sourceFrame, 'x', 'px') as (v: number) => void;
  const setSourceY = gsap.quickSetter(sourceFrame, 'y', 'px') as (v: number) => void;
  const setSourceScaleX = gsap.quickSetter(sourceFrame, 'scaleX') as (v: number) => void;
  const setSourceScaleY = gsap.quickSetter(sourceFrame, 'scaleY') as (v: number) => void;
  const setSourceOpacity = gsap.quickSetter(sourceFrame, 'opacity') as (v: number) => void;

  let start: Rect = { x: 0, y: 0, w: 1, h: 1 };
  let end: Rect = { x: 0, y: 0, w: 1, h: 1 };

  const measure = () => {
    // The source is currently `position: fixed`, so its own rect already
    // reads as viewport-relative regardless of scroll position — reset the
    // transform first or the previous run's transform would be baked in.
    gsap.set(sourceFrame, { x: 0, y: 0, scaleX: 1, scaleY: 1 });
    const s = sourceFrame!.getBoundingClientRect();
    start = { x: s.left, y: s.top, w: s.width, h: s.height };

    const sceneRect = directionsScene!.getBoundingClientRect();
    const t = targetFrame!.getBoundingClientRect();
    end = {
      x: t.left,
      // Relative to the Directions scene's own top: that offset becomes the
      // viewport top the moment its pin engages, which is exactly when this
      // scrub reaches progress 1.
      y: t.top - sceneRect.top,
      w: t.width,
      h: t.height,
    };
  };

  ScrollTrigger.create({
    trigger: spacer,
    start: 'top top',
    end: 'bottom top',
    scrub: TRANSFER.scrub,
    invalidateOnRefresh: true,
    onRefresh: measure,
    onUpdate: ({ progress }) => {
      const bow = Math.sin(progress * Math.PI);
      const dx = (end.x - start.x) * progress + TRANSFER.driftX * bow;
      const dy = (end.y - start.y) * progress + TRANSFER.driftY * bow;
      const sx = 1 + (end.w / start.w - 1) * progress;
      const sy = 1 + (end.h / start.h - 1) * progress;

      setSourceX(dx);
      setSourceY(dy);
      setSourceScaleX(sx);
      setSourceScaleY(sy);
      setSourceElevation(progress > 0.35);

      // Hero copy leaves early, well before the image has finished landing.
      const leaveT = gsap.utils.clamp(0, 1, progress / 0.4);
      setHeroCopyOpacity(1 - leaveT);
      setHeroCopyY(-leaveT * 32);

      // Laser's own copy settles in during the last third.
      const settleT = gsap.utils.clamp(0, 1, (progress - 0.6) / 0.4);
      setLaserPanelOpacity(settleT);
      setLaserPanelY(18 * (1 - settleT));

      // The handoff: swap the traveling fixed image for Laser's resting one
      // in the last sliver of progress, once they occupy the same box.
      const swapT = gsap.utils.clamp(0, 1, (progress - 0.94) / 0.06);
      setSourceOpacity(1 - swapT);
      setTargetOpacity(swapT);
    },
  });

  return () => {
    gsap.set(sourceFrame, { clearProps: 'position,top,left,transform,zIndex,opacity' });
    gsap.set([targetFrame, laserPanel, heroCopy], { clearProps: 'opacity,transform' });
  };
}
