/**
 * Motion tokens — the single vocabulary every animation on the site speaks.
 *
 * Nothing in the motion layer may hard-code a duration, easing or distance.
 * If a value is missing here, add it here first.
 */

export const EASE = {
  /** Entrances: decelerating, never overshoots. */
  out: 'power3.out',
  /** State swaps that go out and come back. */
  inOut: 'power2.inOut',
} as const;

export const DURATION = {
  fast: 0.35,
  base: 0.7,
  slow: 1.1,
} as const;

/** Ordinary scroll reveals (chapters 02–10). */
export const REVEAL = {
  /** Rise distance in px. Large media uses 0 — big images must not slide. */
  distance: 26,
  /** Seconds between staggered siblings. */
  stagger: 0.08,
  /** ScrollTrigger start: element top vs viewport. */
  start: 'top 82%',
  /** Max items in one stagger chain before it reads as a wave. */
  maxChain: 6,
} as const;

/** Cinematic pinned scenes (the two hero sequences). */
export const SCENE = {
  /** Scroll budget of the pinned voyeur scene, in viewport heights. */
  voyeurViewports: 3,
  /** Scroll budget of the heurebleue zoom, in viewport heights. */
  heureBleueViewports: 2.5,
  /** ScrollTrigger scrub smoothing, in seconds. */
  scrub: 1,
  /** Gallery zoom ceiling — mobile needs more travel to fill a narrow frame. */
  zoomDesktop: 2.65,
  zoomMobile: 4,
  /** Viewport width under which the mobile zoom ceiling applies. */
  mobileBreakpoint: 900,
} as const;

/**
 * Staged scenes — the second half's discrete state machine.
 *
 * These replace continuous scrub with a step model: one intentional scroll
 * gesture advances the state index by exactly one, and the visual change that
 * follows is an autoplaying timeline of fixed `STEP.duration`, not a value
 * scrubbed against scroll position. Once triggered, it finishes on its own —
 * stopping the mouse mid-gesture does not leave the composition half-built.
 *
 * A state's container reserves `100vh` (the sticky viewport that holds the
 * current state readable) plus one scroll distance per transition between
 * states. Every per-section distance below is that *transition* distance in
 * viewport heights, the number a reader actually scrolls to move on to the
 * next state — not the total height of the container.
 */
export const STEP = {
  /** Autoplay timeline length for a state swap. */
  duration: 0.7,
  ease: EASE.inOut,
  /** Viewport width under which the mobile distances/layouts apply. */
  mobileBreakpoint: 900,
} as const;

/** 01 — Procedure: context → process → exit, 3 states, 2 transitions. */
export const PROCEDURE = {
  transition: 0.68,
  mobileTransition: 0.58,
} as const;

/** 02 — Equipment: EVERLAS ⇄ TURBO G8, 2 states, 1 transition. */
export const EQUIPMENT = {
  transition: 0.6,
  mobileTransition: 0.55,
} as const;

/** 03 — Process/Experience: 4 posters, 3 transitions, plus scene in/out. */
export const PROCESS = {
  transition: 0.6,
  mobileTransition: 0.5,
  /** Reserved beyond the transitions for the scene's own entry/exit. */
  entryExit: 0.25,
  mobileEntryExit: 0.2,
} as const;

/** 04–05 — Studio gallery states, ending in the transform into Video 01. */
export const STUDIO = {
  transition: 0.65,
  mobileTransition: 0.5,
  /** The still → portrait-video reframe that closes the scene. */
  videoTransition: 0.7,
  mobileVideoTransition: 0.6,
} as const;

/** 06 — Video 01 → 02 → 03, 2 transitions. */
export const VIDEO = {
  transition: 0.65,
  mobileTransition: 0.55,
} as const;

/** 07 — Video 03 → Complexes hand-off (a single fade, not a staged scene). */
export const VIDEO_COMPLEXES = {
  transition: 0.7,
  mobileTransition: 0.55,
} as const;

/** Fixed header height in px — anchor scrolling must clear it. */
export const HEADER_OFFSET = 80;
