/**
 * Scene 03 — the EVERLAS stage (`#everlas`).
 *
 * The one signature scroll moment below the price list, and the only place in
 * the second half that pins for its own sake. It is a single spatial scene, not
 * a sequence of screens: one composition — machine, manipula, copy — read at
 * two depths, and the scroll is what moves between them.
 *
 *   the plate comes forward   scale 0.74 → 1, riding a little upward
 *   the picture settles       counter-zoom 1.2 → 1 inside the frame, so the
 *                             frame grows while its contents come to rest
 *   the detail arrives        the manipula rises out from behind the plate
 *   the copy drifts           and only drifts — it is readable on every frame
 *
 * Everything is one scrubbed timeline of `fromTo`s, so it plays backwards as
 * cleanly as forwards and the context reverts every property it touched.
 *
 * On a phone the stage is not pinned. The same composition transforms over the
 * distance the section itself travels — a short move, not a held screen.
 */

import gsap from 'gsap';
import { EVERLAS_STAGE } from '../tokens';

export function createEverlasStageScene(root: HTMLElement, { pinned }: { pinned: boolean }) {
  const stage = root.querySelector<HTMLElement>('.ev-stage');
  if (!stage) return;

  const copy = stage.querySelector<HTMLElement>('.ev-copy');
  const glow = stage.querySelector<HTMLElement>('.ev-glow');
  const plate = stage.querySelector<HTMLElement>('.ev-plate--main');
  const picture = plate?.querySelector<HTMLElement>('img') ?? null;
  const detail = stage.querySelector<HTMLElement>('.ev-plate--detail');
  if (!copy || !glow || !plate || !picture || !detail) return;

  // The pinned form holds the composition for its own budget; the phone form
  // rides the section past the reader instead. `end` is a function in the pinned
  // branch for the usual reason — a literal freezes at the height of first load.
  const scrollTrigger = pinned
    ? {
        trigger: stage,
        start: 'top top',
        end: () => `+=${window.innerHeight * EVERLAS_STAGE.viewports}`,
        pin: true,
        pinSpacing: true,
        scrub: EVERLAS_STAGE.scrub,
        invalidateOnRefresh: true,
      }
    : {
        trigger: stage,
        start: 'top 86%',
        end: 'bottom 62%',
        scrub: EVERLAS_STAGE.scrub,
        invalidateOnRefresh: true,
      };

  // Linear throughout: the scrub is the ease, and a second one on top of it
  // makes the composition hesitate under a steady scroll.
  gsap
    .timeline({ scrollTrigger, defaults: { ease: 'none' } })
    .fromTo(
      glow,
      { scale: EVERLAS_STAGE.glowScaleFrom, opacity: EVERLAS_STAGE.glowOpacityFrom },
      { scale: 1, opacity: 1, duration: 0.7 },
      0,
    )
    .fromTo(
      plate,
      { scale: EVERLAS_STAGE.plateScaleFrom, yPercent: EVERLAS_STAGE.plateYFrom },
      { scale: 1, yPercent: 0, duration: 0.62 },
      0,
    )
    .fromTo(
      picture,
      { scale: EVERLAS_STAGE.pictureScaleFrom },
      { scale: 1, duration: 0.62 },
      0,
    )
    .fromTo(copy, { y: EVERLAS_STAGE.copyYFrom }, { y: 0, duration: 0.42 }, 0)
    .fromTo(
      detail,
      {
        opacity: 0,
        scale: EVERLAS_STAGE.detailScaleFrom,
        xPercent: EVERLAS_STAGE.detailXFrom,
        yPercent: EVERLAS_STAGE.detailYFrom,
      },
      { opacity: 1, scale: 1, xPercent: 0, yPercent: 0, duration: 0.46 },
      0.36,
    )
    // The tail. The composition does not stop dead at the end of the budget —
    // it keeps drifting into the sequence below, which is what makes the two
    // read as one chapter rather than two scenes with a cut between them.
    .to(plate, { yPercent: EVERLAS_STAGE.plateYTo, duration: 0.36 }, 0.64)
    .to(copy, { y: EVERLAS_STAGE.copyYTo, duration: 0.36 }, 0.64);
}
