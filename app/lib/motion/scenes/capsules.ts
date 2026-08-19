/**
 * Scene 02 — the two-directions capsule swap (`#services`).
 *
 * Adapted from "Capsules Animated Sticky Columns"
 * https://motionprompts.dev/component/capsules-animated-columns/
 *
 * The mechanics are the source's, transcribed: one trigger pins the section
 * over five viewport heights while a second, deliberately longer trigger (six
 * viewport heights) watches progress and fires two discrete phases at 0.33 and
 * 0.66. Nothing here is scrubbed — the phases are time-based `gsap.to` tweens
 * at the source's 0.75s, default ease, fired once per threshold crossing and
 * mirrored on the way back up.
 *
 * What is adapted: the copy, the ViART media and the palette (in CSS), and the
 * off-stage offsets are written through GSAP's own percentage channels
 * (`xPercent`/`yPercent`) rather than parsed back out of a CSS matrix. The
 * geometry is identical — a column is 50% wide, so a 100% translate lands it
 * exactly on the other half. **That 50% is load-bearing; widening it breaks
 * both of the two stops the middle columns have to occupy.**
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type Lenis from 'lenis';
import { CAPSULES } from '../tokens';

/** The source's own line-mask trick: one span per line, clipped by the line. */
function maskLines(element: HTMLElement) {
  const split = SplitText.create(element, { type: 'lines', linesClass: 'cap-line' });
  split.lines.forEach((line) => {
    const span = document.createElement('span');
    span.textContent = line.textContent;
    line.replaceChildren(span);
  });
  return split;
}

export function createCapsulesScene(root: HTMLElement, lenis: Lenis) {
  const section = root.querySelector<HTMLElement>('.cap-scene');
  if (!section) return;

  const col1 = section.querySelector<HTMLElement>('.cap-col--1');
  const col2 = section.querySelector<HTMLElement>('.cap-col--2');
  const col3 = section.querySelector<HTMLElement>('.cap-col--3');
  const col4 = section.querySelector<HTMLElement>('.cap-col--4');
  const photo1 = section.querySelector<HTMLElement>('.cap-img--1 img');
  const capsule2 = section.querySelector<HTMLElement>('.cap-img--2');
  const photo2 = section.querySelector<HTMLElement>('.cap-img--2 img');
  const textA = section.querySelector<HTMLElement>('.cap-text--a');
  const textB = section.querySelector<HTMLElement>('.cap-text--b');

  if (!col1 || !col2 || !col3 || !col4 || !photo1 || !capsule2 || !photo2 || !textA || !textB) return;

  // --- 1. line masks in the swapping text column ----------------------------
  const splits = gsap.utils
    .toArray<HTMLElement>(col3.querySelectorAll('.cap-split'))
    .map(maskLines);

  const linesA = textA.querySelectorAll('.cap-line span');
  const linesB = textB.querySelectorAll('.cap-line span');

  // --- 2. off-stage positions ----------------------------------------------
  // Same values the CSS carries for the pre-JS state, restated in GSAP's
  // percentage channels so the phase tweens animate a known quantity.
  //
  // `x: 0, y: 0` is load-bearing, not tidiness. The columns arrive carrying the
  // stylesheet's own `translateX(100%) translateY(100%)`, and GSAP can only read
  // that back as a resolved matrix — in pixels, on the `x`/`y` channels, with no
  // way to tell it was written as a percentage. Setting `xPercent`/`yPercent`
  // fills a *second*, independent channel, so every column started one full
  // width right and one full height low, and every phase below animated only the
  // percentage half back to zero. The scene then played out with a column-width
  // of horizontal error and a column-height of vertical error: the middle
  // columns landed on the half they were supposed to be leaving, and the
  // swapping text column sat a whole plate below the stage, over the CTA row.
  // Zeroing the pixel channels here hands GSAP the same geometry the CSS states.
  gsap.set(col2, { x: 0, y: 0, xPercent: 100, yPercent: 0, opacity: 1, scale: 1 });
  gsap.set(col3, { x: 0, y: 0, xPercent: 100, yPercent: 100 });
  gsap.set(col4, { x: 0, y: 0, xPercent: 100, yPercent: 100 });
  gsap.set(col1, { x: 0, y: 0, opacity: 1, scale: 1 });
  gsap.set(photo1, { scale: 1 });
  gsap.set(photo2, { scale: 1.25 });
  gsap.set(capsule2, { clipPath: CAPSULES.clipClosed });
  gsap.set(linesA, { y: '0%' });
  gsap.set(linesB, { y: '-125%' });

  const { duration, textDelay } = CAPSULES;

  /**
   * `overwrite: 'auto'` on every phase tween.
   *
   * A threshold crossed twice in quick succession — a flick of the wheel, a
   * trackpad rubber-band, a mobile fling that lands near 0.33 — fires the `in`
   * and then the `out` while the first is still running, and GSAP's default is
   * to let both keep writing. Two 0.75s tweens driving one column to opposite
   * ends is the source of the columns arriving half-way and staying there.
   * `'auto'` kills only the *properties* that actually conflict, so the third
   * column can still be sliding on `yPercent` from phase one while phase two
   * takes over its `xPercent`.
   */
  const phase = (target: gsap.TweenTarget, vars: gsap.TweenVars) =>
    gsap.to(target, { duration, overwrite: 'auto', ...vars });

  const phaseOneIn = () => {
    phase(col1, { opacity: 0, scale: 0.75 });
    phase(col2, { xPercent: 0 });
    phase(col3, { yPercent: 0 });
    phase(photo1, { scale: 1.25 });
    phase(capsule2, { clipPath: CAPSULES.clipOpen });
    phase(photo2, { scale: 1 });
  };

  const phaseOneOut = () => {
    phase(col1, { opacity: 1, scale: 1 });
    phase(col2, { xPercent: 100 });
    phase(col3, { yPercent: 100 });
    phase(photo1, { scale: 1 });
    phase(capsule2, { clipPath: CAPSULES.clipClosed });
    phase(photo2, { scale: 1.25 });
  };

  const phaseTwoIn = () => {
    phase(col2, { opacity: 0, scale: 0.75 });
    phase(col3, { xPercent: 0 });
    phase(col4, { yPercent: 0 });
    phase(linesA, { y: '-125%' });
    phase(linesB, { y: '0%', delay: textDelay });
  };

  const phaseTwoOut = () => {
    phase(col2, { opacity: 1, scale: 1 });
    phase(col3, { xPercent: 100 });
    phase(col4, { yPercent: 100 });
    phase(linesA, { y: '0%', delay: textDelay });
    phase(linesB, { y: '-125%' });
  };

  // --- 3. gesture gate -------------------------------------------------------
  // A fling is not one scroll frame — Lenis's default `lerp` smoothing eases
  // toward the wheel/touch target over many frames, so the momentum from one
  // physical gesture keeps moving the section for a few hundred ms after the
  // input itself stops. Left alone, that coast carries progress straight past
  // a second threshold on the heels of the first, and the "лазерная эпиляция"
  // state is never actually read before "массаж" replaces it.
  //
  // `locked` closes the instant one phase fires. `killMomentum` collapses
  // Lenis's target onto its current position at that same instant, so the
  // coast that would have carried the gesture into the next threshold is cut
  // off rather than merely ignored. `locked` only reopens once real
  // wheel/touch input has gone quiet for `gestureIdleMs` — i.e. once the
  // gesture that caused it is actually over. A new gesture is what reopens
  // it, not the passage of time alone.
  //
  // Ordinary scrolling — no phase fired, nothing locked — must reach the
  // idle gap between two unrelated notches too, and killing momentum there
  // as well would truncate every gesture's own natural coast to whatever
  // sliver of it lands inside `gestureIdleMs`. The kill only belongs to
  // cleaning up after a lock, so it stays conditional on one having fired.
  let locked = false;
  let idleTimer: ReturnType<typeof setTimeout> | null = null;

  const killMomentum = () => {
    lenis.scrollTo(lenis.animatedScroll, { immediate: true, force: true });
  };

  const armIdleRelease = () => {
    if (idleTimer !== null) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      idleTimer = null;
      if (locked) {
        locked = false;
        killMomentum();
      }
    }, CAPSULES.gestureIdleMs);
  };

  const onGestureActivity = () => armIdleRelease();

  let gestureListenersActive = false;
  const addGestureListeners = () => {
    if (gestureListenersActive) return;
    gestureListenersActive = true;
    window.addEventListener('wheel', onGestureActivity, { passive: true });
    window.addEventListener('touchstart', onGestureActivity, { passive: true });
    window.addEventListener('touchmove', onGestureActivity, { passive: true });
    window.addEventListener('touchend', onGestureActivity, { passive: true });
  };
  const removeGestureListeners = () => {
    if (!gestureListenersActive) return;
    gestureListenersActive = false;
    window.removeEventListener('wheel', onGestureActivity);
    window.removeEventListener('touchstart', onGestureActivity);
    window.removeEventListener('touchmove', onGestureActivity);
    window.removeEventListener('touchend', onGestureActivity);
    if (idleTimer !== null) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
    locked = false;
  };

  // --- 4. the two triggers --------------------------------------------------
  // The pin carries no animation; the progress trigger carries no pin and runs
  // longer, so both thresholds land inside the pinned range. The gesture
  // listeners only exist while this section is actually pinned — nowhere else
  // on the page reads a wheel event.
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${window.innerHeight * CAPSULES.pinViewports}`,
    pin: true,
    pinSpacing: true,
    invalidateOnRefresh: true,
    onEnter: addGestureListeners,
    onEnterBack: addGestureListeners,
    onLeave: removeGestureListeners,
    onLeaveBack: removeGestureListeners,
  });

  // Lives outside the trigger, inside this closure — never at module scope, or
  // a remount would resume from a phase the columns are not actually in.
  let currentPhase = 0;

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${window.innerHeight * CAPSULES.progressViewports}`,
    invalidateOnRefresh: true,
    onUpdate: ({ progress }) => {
      // A gesture already spent its one transition — hold the phase where it
      // is until the input that drove it goes quiet. `return`s below also
      // stop a single call from resolving more than one threshold, which is
      // what let one frame fire both phases back to back.
      if (locked) return;

      if (progress >= CAPSULES.phaseOne && currentPhase === 0) {
        currentPhase = 1;
        locked = true;
        phaseOneIn();
        killMomentum();
        return;
      }
      if (progress >= CAPSULES.phaseTwo && currentPhase === 1) {
        currentPhase = 2;
        locked = true;
        phaseTwoIn();
        killMomentum();
        return;
      }
      if (progress < CAPSULES.phaseTwo && currentPhase === 2) {
        currentPhase = 1;
        locked = true;
        phaseTwoOut();
        killMomentum();
        return;
      }
      if (progress < CAPSULES.phaseOne && currentPhase === 1) {
        currentPhase = 0;
        locked = true;
        phaseOneOut();
        killMomentum();
      }
    },
  });

  // The context reverts the tweens and the triggers; the splits are DOM the
  // context never made, so they are undone here — after the tweens targeting
  // the generated spans have been killed.
  return () => {
    removeGestureListeners();
    gsap.killTweensOf([linesA, linesB]);
    splits.forEach((split) => split.revert());
  };
}
