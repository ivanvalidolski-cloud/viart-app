/**
 * Generic gesture-gated stepped scene.
 *
 * Extracted from the site's first stepper (the two-directions swap) so the
 * same control model can drive Directions, Procedure, Equipment and Videos
 * without four copies of the same gate: one wheel/touch gesture is either a
 * complete state change or nothing. It never advances a state in proportion
 * to how far the reader scrolled, so the section's whole scroll distance is
 * driven by this state machine, not by scroll position — real scrolling is
 * frozen (`lenis.stop()`) for as long as the section is pinned.
 *
 * `locked` closes the instant one gesture fires and blocks every wheel/touch
 * event until BOTH: real input has gone quiet for `gestureIdleMs` (a
 * trackpad swipe is dozens of wheel events, not one), and the fired
 * transition has actually finished (`animating`, cleared by its own reported
 * duration). Reopening needs both — idle alone would let a second, genuinely
 * separate gesture land mid-transition and start the next state on top of
 * the one still resolving.
 */

import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';
import { STEPPED } from './tokens';

export type StepRun = { run: () => void; duration: number };

export type SteppedSceneConfig = {
  /** Number of discrete states, e.g. 2 for Laser/Massage, 4 for Procedure 01-04. */
  steps: number;
  /** Called with the FROM index (0..steps-2) when the reader advances one state. */
  forward: (fromStep: number) => StepRun;
  /** Called with the FROM index (1..steps-1) when the reader retreats one state. */
  backward: (fromStep: number) => StepRun;
  /** Fires after a transition's target step is committed (before its tween finishes). */
  onStepChange?: (step: number) => void;
  /** Pin length, in viewport heights. Nothing scrubs against this any more —
   *  it only has to give the pin/unpin machinery room to work in. */
  pinViewports?: number;
  gestureIdleMs?: number;
  touchThreshold?: number;
  exitOvershoot?: number;
};

export function createSteppedScene(section: HTMLElement, lenis: Lenis, config: SteppedSceneConfig) {
  const {
    steps,
    forward,
    backward,
    onStepChange,
    pinViewports = 1,
    gestureIdleMs = STEPPED.gestureIdleMs,
    touchThreshold = STEPPED.touchThreshold,
    exitOvershoot = STEPPED.exitOvershoot,
  } = config;

  let step = 0;
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
    }, gestureIdleMs);
  };

  /** Runs a step's transition and holds the gate until it has actually
   *  finished, not just until input goes quiet. */
  const runStep = ({ run, duration }: StepRun) => {
    locked = true;
    animating = true;
    run();
    if (settleTimer !== null) clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      settleTimer = null;
      animating = false;
      attemptUnlock();
    }, duration * 1000);
  };

  /** Releases the pin and hands scrolling back to Lenis, aimed just past the
   *  boundary the reader is leaving through. */
  const exit = (direction: 'forward' | 'backward') => {
    locked = true;
    lenis.start();
    const target =
      direction === 'forward'
        ? (pinTrigger?.end ?? 0) + exitOvershoot
        : (pinTrigger?.start ?? 0) - exitOvershoot;
    lenis.scrollTo(target, { immediate: false });
  };

  const triggerForward = () => {
    if (step < steps - 1) {
      const from = step;
      step += 1;
      onStepChange?.(step);
      runStep(forward(from));
    } else {
      exit('forward');
    }
  };

  const triggerBackward = () => {
    if (step > 0) {
      const from = step;
      step -= 1;
      onStepChange?.(step);
      runStep(backward(from));
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
    if (Math.abs(delta) < touchThreshold) return;
    touchConsumed = true;
    if (delta > 0) triggerForward();
    else triggerBackward();
  };

  const onTouchEnd = () => armIdleRelease();

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'PageDown') {
      event.preventDefault();
      if (!locked) triggerForward();
    } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
      event.preventDefault();
      if (!locked) triggerBackward();
    }
  };

  let gestureListenersActive = false;
  const addGestureListeners = () => {
    if (gestureListenersActive) return;
    gestureListenersActive = true;
    lenis.stop();
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeydown);
  };
  const removeGestureListeners = () => {
    if (!gestureListenersActive) return;
    gestureListenersActive = false;
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('keydown', onKeydown);
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

  // Entering from above always resumes at state 0; entering from below —
  // scrolling back up into this section — resumes at the last state, the one
  // the reader was looking at when they left.
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${window.innerHeight * pinViewports}`,
    pin: true,
    pinSpacing: true,
    invalidateOnRefresh: true,
    onEnter: (self) => {
      pinTrigger = self;
      step = 0;
      onStepChange?.(step);
      addGestureListeners();
    },
    onEnterBack: (self) => {
      pinTrigger = self;
      step = steps - 1;
      onStepChange?.(step);
      addGestureListeners();
    },
    onLeave: removeGestureListeners,
    onLeaveBack: removeGestureListeners,
  });

  return removeGestureListeners;
}
