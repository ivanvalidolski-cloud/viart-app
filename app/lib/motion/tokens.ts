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
 * Budgets and constants of the adapted external scenes.
 *
 * The clip-paths, tween duration and text delay below are transcribed from
 * the scene's own source (the MotionPrompts prompt named in the scene
 * module) and are part of that scene's animation, not a taste value to tune.
 * The gesture constants are this site's own addition — the source scrubs the
 * swap against scroll position, this site steps it one wheel/touch gesture
 * at a time instead — and live here for the same reason: so the whole page's
 * scroll cost can be read in one place.
 */
export const CAPSULES = {
  /** Pin length of the capsule section, in viewport heights. Kept to one
   *  screen: nothing scrubs against this distance any more, it only has to
   *  be enough for the pin/unpin machinery to have room to work in. */
  pinViewports: 1,
  /** Every phase tween in the source runs at this length, default ease. */
  duration: 0.75,
  /** The incoming text block waits this long before dropping in. */
  textDelay: 0.5,
  /** Collapsed and open clip-paths of the second image capsule. */
  clipClosed: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
  clipOpen: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  /**
   * Silence, in ms, after the last wheel/touch input before a gesture counts
   * as finished. One gesture may fire at most one state change; the next one
   * waits for this much quiet, and for the current tween to finish, before it
   * will fire again.
   */
  gestureIdleMs: 140,
  /** Vertical drag, in px, a touch swipe needs before it counts as a gesture. */
  touchThreshold: 40,
  /** How far past the pin's start/end the exit scroll aims — just enough that
   *  the crossing is unambiguous, not a distance the reader ever feels. */
  exitOvershoot: 2,
} as const;

/**
 * Scene 03 — the journey track (`#everlas`): Procedure's square cards and
 * Studio's portrait frames on one continuous horizontal track, pinned and
 * scrubbed over a single scroll budget so the hand-off between them is one
 * transform, never a separate section starting over.
 */
export const JOURNEY = {
  /** Pinned/scrubbed runway of the whole track, in viewport heights. */
  viewports: 8,
  scrub: 1,
  /** Opacity of a procedure card whose stage is not the active one. */
  dimOpacity: 0.5,
  /**
   * Fraction of the track's progress spent inside the four procedure cards
   * before the studio frames take over the counter/caption band. Kept
   * proportional to the card counts (4 procedure : 5 studio) so neither half
   * is rushed relative to how much track it actually occupies.
   */
  procedureFraction: 4 / 9,
  /** How much wider the dominant last studio frame grows as the track ends,
   *  so the multi-image line resolves onto one frame instead of stopping
   *  mid-row. */
  finalCardGrowth: 1.35,
  /** Fraction of progress (from the end) over which that growth happens. */
  resolveSpan: 0.14,
} as const;

/** Fixed header height in px — anchor scrolling must clear it. */
export const HEADER_OFFSET = 80;
