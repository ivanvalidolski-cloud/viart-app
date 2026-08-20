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
  /** ScrollTrigger scrub smoothing, in seconds. */
  scrub: 1,
  /** Viewport width under which the mobile composition applies. */
  mobileBreakpoint: 900,
} as const;

/**
 * Gesture-gate constants shared by every stepped scene (`steppedScene.ts`):
 * Hero→Directions, Procedure, Equipment, Videos. One wheel/touch gesture is
 * either a complete state change or nothing — real scrolling is frozen for
 * as long as the section is pinned, so these are this site's own addition,
 * not transcribed from an external source.
 */
export const STEPPED = {
  /**
   * Silence, in ms, after the last wheel/touch input before a gesture counts
   * as finished. One gesture may fire at most one state change; the next one
   * waits for this much quiet, and for the current transition to finish,
   * before it will fire again.
   */
  gestureIdleMs: 140,
  /** Vertical drag, in px, a touch swipe needs before it counts as a gesture. */
  touchThreshold: 40,
  /** How far past the pin's start/end the exit scroll aims — just enough that
   *  the crossing is unambiguous, not a distance the reader ever feels. */
  exitOvershoot: 2,
} as const;

/**
 * Scene 01 — the hero → Laser signature transfer. One continuous scroll
 * budget: the dominant hero image travels via GSAP Flip into Laser's media
 * slot while the hero copy leaves and Laser's copy settles in.
 */
export const TRANSFER = {
  /** Scroll budget of the transfer, in viewport heights (desktop). Longer
   *  than an ordinary chapter transition — this is the signature move. */
  viewports: 1.3,
  viewportsMobile: 0.85,
  scrub: 0.7,
  /** Slight diagonal/asymmetric travel, in px at 1x progress, added on top
   *  of the Flip-computed path so the move reads as authored, not mechanical. */
  driftX: -24,
  driftY: 18,
} as const;

/** Scene 02 — Directions (`#services`): Laser, then Massage. Two states,
 *  stepped one gesture at a time. Short and calm — never a repeat of the
 *  hero's deep transfer. */
export const DIRECTIONS = {
  pinViewports: 1,
  /** Seconds. Within the spec's 550–900ms chapter-transition budget. */
  duration: 0.7,
} as const;

/** Scene 03 — Procedure (`#everlas`), stages 01→04. Stepped, one gesture per
 *  number. */
export const PROCEDURE = {
  pinViewports: 1,
  duration: 0.6,
} as const;

/** Scene 04 — Equipment: EVERLAS → TURBO G8. Two states, stepped. */
export const EQUIPMENT = {
  pinViewports: 1,
  duration: 0.6,
} as const;

/** Scene 05 — Videos: three tiles → Anna + complex. Two states, stepped. */
export const VIDEOS = {
  pinViewports: 1,
  duration: 0.6,
} as const;

/** Fixed header height in px — anchor scrolling must clear it. */
export const HEADER_OFFSET = 80;
