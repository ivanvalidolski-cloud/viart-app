/**
 * Scene 02 — the laser chapter (`#services`).
 *
 * Three states of one direction — «Лазерная эпиляция» on EVERLAS — read inside
 * a single sticky viewport. Desktop only: the stage is pinned for
 * `LASER.pinViewports` on top of its own screen, so the whole block costs about
 * 1.9 viewports of scroll and every one of them puts a new state on the page.
 *
 * One number drives everything. `position` is a continuous place in the list, 0
 * at the first state and `total - 1` at the last, and a state's copy and its
 * picture are both a pure function of the same distance to it:
 *
 *   the copy      fades on `presenceOf` and travels ±`copyTravel` through the slot
 *   the picture   fades on the *same* value and settles out of `mediaScaleFrom`
 *
 * That shared value is the whole point. "Text and its media are one animation
 * state" is not something kept in sync by hand here — there is only one curve,
 * and both layers read it, so they cannot enter or leave at different moments.
 *
 * Nothing is split into letters and nothing moves independently: a state
 * arrives as a block, is held for the plateau, and leaves as a block.
 *
 * Below `SCENE.mobileBreakpoint` this scene is not built at all. There the same
 * three states are ordinary stacked blocks in flow — a phone reads them by
 * scrolling, not by holding a screen still.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { quickScale } from '../setters';
import { LASER, presenceOf } from '../tokens';

export function createLaserStoryScene(root: HTMLElement, { wide }: { wide: boolean }) {
  if (!wide) return;

  const section = root.querySelector<HTMLElement>('.laser-scene');
  if (!section) return;

  const stage = section.querySelector<HTMLElement>('.laser-stage');
  // `.laser-copy`, not `.laser-state`: on a desktop the state block is
  // `display: contents` and has no box of its own, so an opacity written on it
  // would render nothing.
  const copies = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('.laser-copy'));
  const frames = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('.laser-frame'));
  if (!stage || !copies.length || copies.length !== frames.length) return;

  const total = copies.length;

  const setCopyOpacity = copies.map((el) => gsap.quickSetter(el, 'opacity') as (v: number) => void);
  const setCopyY = copies.map((el) => gsap.quickSetter(el, 'y', 'px') as (v: number) => void);
  const setFrameOpacity = frames.map((el) => gsap.quickSetter(el, 'opacity') as (v: number) => void);
  const setFrameScale = frames.map((el) => quickScale(el));

  const apply = (progress: number) => {
    const states = Math.min(1, progress / LASER.statesEnd);
    const position = states * (total - 1);

    for (let index = 0; index < total; index += 1) {
      const distance = position - index;
      const near = presenceOf(distance, LASER.fadeEnd, LASER.fadeSpan);
      // Both layers of a state read `near`. The only difference between them is
      // how that presence is expressed — the copy travels, the plate settles.
      setCopyOpacity[index](near);
      setCopyY[index](-gsap.utils.clamp(-1, 1, distance) * LASER.copyTravel);
      setFrameOpacity[index](near);
      setFrameScale[index](1 + (1 - near) * (LASER.mediaScaleFrom - 1));
    }
  };

  ScrollTrigger.create({
    trigger: stage,
    start: 'top top',
    end: () => `+=${window.innerHeight * LASER.pinViewports}`,
    pin: true,
    pinSpacing: true,
    scrub: LASER.scrub,
    invalidateOnRefresh: true,
    // Re-state on refresh as well as on update: a refresh that only re-measures
    // leaves the states at the presence they had under the old geometry until
    // the next scroll event.
    onRefresh: (self) => apply(self.progress),
    onUpdate: (self) => apply(self.progress),
  });

  // Written from a callback the context never sees, so cleared by hand.
  return () => {
    gsap.set([...copies, ...frames], { clearProps: 'transform' });
    [...copies, ...frames].forEach((element) => element.style.removeProperty('opacity'));
  };
}
