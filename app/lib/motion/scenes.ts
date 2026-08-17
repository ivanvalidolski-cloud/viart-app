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
import { SCENE } from './tokens';

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
