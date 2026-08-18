/**
 * Scene 04 — the procedure sequence (`.spot-scene`).
 *
 * The four states of a course — подготовка, настройка, процедура, курс — read
 * out of the EVERLAS stage above rather than opened as a new scene: the same
 * chapter, the same ground, no second heading and no reset between them.
 *
 * One number drives the whole thing. `position` is a continuous place in the
 * list, 0 at the first state and 3 at the last, and everything is a pure
 * function of it:
 *
 *   the column   is translated so the frame at `position` sits on the stage's
 *                own middle line — the geometry is measured, not assumed, so
 *                the lit frame is genuinely the centred one at every width
 *   the frames   take their opacity from their distance to `position`
 *   the lines    take the same distance, so the words shown and the picture
 *                centred are the same state by construction
 *
 * That is the whole reason this is written as one derived position rather than
 * as four steps: a stepped counter and a linearly travelling column agree on a
 * desktop column and stop agreeing the moment the responsive block opens the
 * gaps, which is how a sequence ends up describing a picture nobody can see.
 *
 * The last stretch of the scrub (`SPOTLIGHT.statesEnd` → 1) steps nothing. It
 * is the release: the dimmed frames come back up, the composition drifts on,
 * and by the time the pin lets go the scene is already moving with the page
 * instead of being cut loose from it.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SPOTLIGHT } from '../tokens';

export function createProcedureSequenceScene(root: HTMLElement, { wide }: { wide: boolean }) {
  const section = root.querySelector<HTMLElement>('.spot-scene');
  if (!section) return;

  const column = section.querySelector<HTMLElement>('.spot-images');
  const frames = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('.spot-img'));
  const names = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('.spot-name'));

  if (!column) return;
  // The frames and the lines are two views of one list. If they ever disagree,
  // every distance below would be measured against the wrong one.
  if (!frames.length || frames.length !== names.length) return;

  const total = frames.length;

  // The CSS centres the column with `translateX(-50%)`. Restating it through
  // GSAP's percentage channel keeps the centring live — a plain matrix would be
  // read once, in pixels, and go stale the moment the column resizes.
  gsap.set(column, { xPercent: -50 });

  const setColumnY = gsap.quickSetter(column, 'y', 'px') as (value: number) => void;
  const setFrameOpacity = frames.map(
    (frame) => gsap.quickSetter(frame, 'opacity') as (value: number) => void,
  );
  const setNameY = names.map(
    (name) => gsap.quickSetter(name, 'y', 'px') as (value: number) => void,
  );
  const setNameOpacity = names.map(
    (name) => gsap.quickSetter(name, 'opacity') as (value: number) => void,
  );

  /** How present a state is, given its distance from the current position. */
  const presence = (distance: number) =>
    gsap.utils.clamp(
      0,
      1,
      (SPOTLIGHT.stateFadeEnd - Math.abs(distance)) / SPOTLIGHT.stateFadeSpan,
    );

  // Cached on refresh — never read inside the update pass.
  let columnStops: number[] = [];
  let releaseDrift = 0;

  const measure = () => {
    const styles = getComputedStyle(section);
    const paddingTop = parseFloat(styles.paddingTop) || 0;
    const paddingBottom = parseFloat(styles.paddingBottom) || 0;
    // The middle of the band the section actually shows — the top padding is
    // the strip the fixed header paints over.
    const middle = paddingTop + (section.offsetHeight - paddingTop - paddingBottom) / 2;
    // `offsetTop` is layout, so the column's own transform does not disturb it.
    columnStops = frames.map((frame) => middle - (frame.offsetTop + frame.offsetHeight / 2));
    releaseDrift = window.innerHeight * SPOTLIGHT.releaseDrift;
  };

  const apply = (progress: number) => {
    const states = Math.min(1, progress / SPOTLIGHT.statesEnd);
    const release = Math.max(0, (progress - SPOTLIGHT.statesEnd) / (1 - SPOTLIGHT.statesEnd));
    const position = states * (total - 1);

    setColumnY(gsap.utils.interpolate(columnStops, states) - release * releaseDrift);

    const dim = gsap.utils.interpolate(SPOTLIGHT.dimOpacity, SPOTLIGHT.releaseOpacity, release);
    const lift = release * SPOTLIGHT.releaseLift;

    for (let index = 0; index < total; index += 1) {
      const distance = position - index;
      const near = presence(distance);
      setFrameOpacity[index](dim + (1 - dim) * near);
      setNameOpacity[index](near);
      setNameY[index](-gsap.utils.clamp(-1, 1, distance) * SPOTLIGHT.nameTravel - lift);
    }
  };

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () =>
      `+=${window.innerHeight * (wide ? SPOTLIGHT.viewports : SPOTLIGHT.mobileViewports)}`,
    pin: true,
    pinSpacing: true,
    scrub: SPOTLIGHT.scrub,
    invalidateOnRefresh: true,
    // Re-measure and re-state in one pass: a refresh that only re-measures
    // leaves the column at the offset it had under the old geometry until the
    // next scroll event moves it.
    onRefresh: (self) => {
      measure();
      apply(self.progress);
    },
    onUpdate: (self) => apply(self.progress),
  });

  // The opacity and transform above are written from a callback the context
  // never sees, so they are cleared by hand before it reverts.
  return () => {
    gsap.set([column, ...names], { clearProps: 'transform' });
    frames.forEach((frame) => frame.style.removeProperty('opacity'));
    names.forEach((name) => name.style.removeProperty('opacity'));
  };
}
