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

/** Fixed header height in px — anchor scrolling must clear it. */
export const HEADER_OFFSET = 80;
