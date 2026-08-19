/**
 * Scene 02 — the two-directions capsule swap (`#services`).
 *
 * Adapted from "Capsules Animated Sticky Columns"
 * https://motionprompts.dev/component/capsules-animated-columns/
 *
 * The state tweens are the source's, transcribed: time-based `gsap.to` calls
 * at the source's 0.75s, default ease. What is not the source's is how they
 * fire — the source scrubs the swap against scroll progress; this site steps
 * it instead. The section pins for one viewport, and each state change is
 * triggered directly off a wheel/touch gesture (see the "gesture gate"
 * section below): one gesture is either a complete state change or nothing,
 * and scrolling itself is frozen (`lenis.stop()`) for as long as the section
 * is pinned, so the reader is never asked to keep scrolling for a swap to
 * finish, and a gesture mid-tween cannot start a second swap on top of it.
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

  // Total on-screen runtime of each phase, for the gesture gate below. Phase
  // two's text swap runs its incoming/outgoing line behind `textDelay`, so it
  // settles later than every other tween in the same phase.
  const PHASE_ONE_RUNTIME = duration;
  const PHASE_TWO_RUNTIME = duration + textDelay;

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
  // Control model: TRIGGERED, not scrub-driven. One wheel/touch gesture is
  // either the first state change or it is nothing — it never advances the
  // swap in proportion to how far the reader scrolled. That means real
  // scrolling cannot be allowed to happen while a gesture is being read: the
  // whole time the section is pinned, `lenis.stop()` freezes the scroll
  // position and every wheel/touchmove event is `preventDefault`ed, so the
  // three states and the exits at either end are driven entirely by this
  // state machine, not by scroll distance.
  //
  // `locked` closes the instant one gesture fires — a state tween or an exit
  // scroll — and blocks every wheel/touch event until BOTH: real input has
  // gone quiet for `gestureIdleMs` (a trackpad swipe is dozens of wheel
  // events, not one), and whatever fired has actually finished (`animating`,
  // cleared by its own total runtime — phase two's is longer than `duration`
  // because `linesA`/`linesB` carry `textDelay`). Reopening needs both: idle
  // alone would let a second, genuinely separate gesture land mid-tween and
  // start the next state on top of the one still resolving.
  // Named `step`, not `phase` — that name is already the per-property tween
  // helper above, and this is the reader's position in the state machine.
  let step: 0 | 1 | 2 = 0;
  let locked = false;
  let idleTimer: ReturnType<typeof setTimeout> | null = null;
  let settleTimer: ReturnType<typeof setTimeout> | null = null;
  let idleReached = false;
  let animating = false;
  let pinTrigger: ScrollTrigger | null = null;

  const attemptUnlock = () => {
    if (!locked || animating || !idleReached) return;
    locked = false;
  };

  const armIdleRelease = () => {
    idleReached = false;
    if (idleTimer !== null) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      idleTimer = null;
      idleReached = true;
      attemptUnlock();
    }, CAPSULES.gestureIdleMs);
  };

  /** Runs a state's tweens and holds the gate until they have actually
   *  finished, not just until input goes quiet. */
  const runPhase = (fire: () => void, totalDuration: number) => {
    locked = true;
    animating = true;
    fire();
    if (settleTimer !== null) clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      settleTimer = null;
      animating = false;
      attemptUnlock();
    }, totalDuration * 1000);
  };

  /** Releases the pin and hands scrolling back to Lenis, aimed just past the
   *  boundary the reader is leaving through — the third forward gesture into
   *  Pricing, or the symmetric one backing out above the section. Nothing
   *  further is required of the reader: the scroll finishes the exit itself. */
  const exit = (direction: 'forward' | 'backward') => {
    locked = true;
    lenis.start();
    const target =
      direction === 'forward'
        ? (pinTrigger?.end ?? 0) + CAPSULES.exitOvershoot
        : (pinTrigger?.start ?? 0) - CAPSULES.exitOvershoot;
    lenis.scrollTo(target, { immediate: false });
  };

  const triggerForward = () => {
    if (step === 0) {
      step = 1;
      runPhase(phaseOneIn, PHASE_ONE_RUNTIME);
    } else if (step === 1) {
      step = 2;
      runPhase(phaseTwoIn, PHASE_TWO_RUNTIME);
    } else {
      exit('forward');
    }
  };

  const triggerBackward = () => {
    if (step === 2) {
      step = 1;
      runPhase(phaseTwoOut, PHASE_TWO_RUNTIME);
    } else if (step === 1) {
      step = 0;
      runPhase(phaseOneOut, PHASE_ONE_RUNTIME);
    } else {
      exit('backward');
    }
  };

  let touchStartY = 0;
  let touchConsumed = false;

  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    armIdleRelease();
    if (locked || event.deltaY === 0) return;
    if (event.deltaY > 0) triggerForward();
    else triggerBackward();
  };

  const onTouchStart = (event: TouchEvent) => {
    touchStartY = event.touches[0]?.clientY ?? 0;
    touchConsumed = false;
    armIdleRelease();
  };

  const onTouchMove = (event: TouchEvent) => {
    event.preventDefault();
    armIdleRelease();
    if (locked || touchConsumed) return;
    const y = event.touches[0]?.clientY ?? touchStartY;
    const delta = touchStartY - y;
    if (Math.abs(delta) < CAPSULES.touchThreshold) return;
    touchConsumed = true;
    if (delta > 0) triggerForward();
    else triggerBackward();
  };

  const onTouchEnd = () => armIdleRelease();

  let gestureListenersActive = false;
  const addGestureListeners = () => {
    if (gestureListenersActive) return;
    gestureListenersActive = true;
    lenis.stop();
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
  };
  const removeGestureListeners = () => {
    if (!gestureListenersActive) return;
    gestureListenersActive = false;
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    if (idleTimer !== null) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
    if (settleTimer !== null) {
      clearTimeout(settleTimer);
      settleTimer = null;
    }
    animating = false;
    idleReached = false;
    locked = false;
    lenis.start();
  };

  // --- 4. the pin --------------------------------------------------------
  // One viewport of pin distance — nothing scrubs against it any more, it
  // only has to give the pin/unpin machinery room to work in. Entering from
  // above always starts the reader at state 0 (screenshot 1); entering from
  // below — scrolling back up out of Pricing — always resumes at state 2, the
  // state the reader was looking at when they left.
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${window.innerHeight * CAPSULES.pinViewports}`,
    pin: true,
    pinSpacing: true,
    invalidateOnRefresh: true,
    onEnter: (self) => {
      pinTrigger = self;
      step = 0;
      addGestureListeners();
    },
    onEnterBack: (self) => {
      pinTrigger = self;
      step = 2;
      addGestureListeners();
    },
    onLeave: removeGestureListeners,
    onLeaveBack: removeGestureListeners,
  });

  // The context reverts the tweens and the trigger; the splits are DOM the
  // context never made, so they are undone here — after the tweens targeting
  // the generated spans have been killed.
  return () => {
    removeGestureListeners();
    gsap.killTweensOf([linesA, linesB]);
    splits.forEach((split) => split.revert());
  };
}
