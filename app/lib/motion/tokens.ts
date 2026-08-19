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
 * Every number below is transcribed from the scene's own source (the
 * MotionPrompts prompt named in the scene module) and is part of that scene's
 * progress mapping — it is not a taste value to tune. Changing one changes
 * where a phase fires, so they live here only so the whole page's scroll cost
 * can be read in one place.
 */
export const CAPSULES = {
  /** Pin length of the capsule section, in viewport heights. */
  pinViewports: 5,
  /** Progress-trigger length — deliberately longer than the pin. */
  progressViewports: 6,
  /** Phase thresholds on the progress trigger. */
  phaseOne: 0.33,
  phaseTwo: 0.66,
  /** Every phase tween in the source runs at this length, default ease. */
  duration: 0.75,
  /** The incoming text block waits this long before dropping in. */
  textDelay: 0.5,
  /** Collapsed and open clip-paths of the second image capsule. */
  clipClosed: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
  clipOpen: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  /**
   * Silence, in ms, after the last wheel/touch input before a gesture counts
   * as finished. One gesture may fire at most one phase transition; the next
   * transition waits for this much quiet before it will fire again.
   */
  gestureIdleMs: 140,
} as const;

export const SPOTLIGHT = {
  /** Pinned/scrubbed runway of the EVERLAS spotlight, in viewport heights. */
  viewports: 5,
  scrub: 1,
  /** Opacity of an image whose stage is not the active one. */
  dimOpacity: 0.5,
} as const;

export const MOSAIC = {
  /** Wave offset between the five anti-diagonals, in seconds. */
  waveOffset: 0.125,
  /** Per-tile clip-path tween. */
  duration: 0.5,
  stagger: 0.1,
  ease: 'power2.out',
  start: 'top 75%',
} as const;

export const VIDEO_GROW = {
  /** The whole rig is desktop-only, gated on this width. */
  minWidth: 900,
  scaleFrom: 0.25,
  gapFrom: 2,
  gapTo: 1,
  /** Two-phase title size: 80 → 40 over the first 40%, then 40 → 20. */
  fontFrom: 80,
  fontMid: 40,
  fontTo: 20,
  fontSplit: 0.4,
  /** Lerp factor of the mouse parallax follow. */
  mouseLerp: 0.05,
  /** Above this scale the parallax target snaps back to centre. */
  parallaxCutoff: 0.95,
} as const;

export const STICKY_CARDS = {
  scrub: 0.5,
  /** Outgoing card. */
  cardScale: 0.5,
  cardRotation: 10,
  /** Its photograph counter-zooms while the card shrinks. */
  imageScale: 1.5,
} as const;

/** Fixed header height in px — anchor scrolling must clear it. */
export const HEADER_OFFSET = 80;
