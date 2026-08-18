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
} as const;

/**
 * The EVERLAS stage — the single signature moment of the second half.
 *
 * One controlled spatial scene: the machine comes forward out of its own depth
 * while the picture inside the frame counter-zooms, the manipula detail arrives
 * from behind it, and the copy only drifts. Every number is a starting offset
 * of that one composition; nothing here is a separate animation screen.
 */
export const EVERLAS_STAGE = {
  /**
   * Pinned scroll budget, in viewport heights. Desktop only.
   *
   * This is the page's one held moment below the price list, so it is worth
   * more than a glance — but it is one composition, not four, and it must stay
   * shorter than the sequence that has four states to get through.
   */
  viewports: 2.2,
  scrub: 1,
  /** How far back the dominant plate starts, and how far it rides. */
  plateScaleFrom: 0.74,
  plateYFrom: 8,
  plateYTo: -3,
  /** Counter-zoom inside the plate — the frame grows, the picture settles. */
  pictureScaleFrom: 1.2,
  /** The detail plate rises out from behind the dominant one. */
  detailScaleFrom: 0.84,
  detailXFrom: 12,
  detailYFrom: 16,
  /** The copy is readable on every frame; only its position moves. */
  copyYFrom: 24,
  copyYTo: -18,
  glowScaleFrom: 0.62,
  glowOpacityFrom: 0.18,
} as const;

/**
 * The procedure sequence — the four states, continuing out of the stage above.
 *
 * One scroll position drives everything: the frame that is centred, the line
 * that is shown and the dimming of the other three are all read off it, so the
 * media, the text and the active state cannot drift apart at any width.
 */
export const SPOTLIGHT = {
  /** Pinned/scrubbed runway, in viewport heights. */
  viewports: 4,
  /** A phone reads the same four states over a shorter runway. */
  mobileViewports: 3,
  scrub: 1,
  /** Opacity of a frame whose state is not the active one. */
  dimOpacity: 0.5,
  /**
   * The four states occupy this fraction of the scrub. The rest is the release:
   * the sequence stops stepping, the composition opens back up and drifts into
   * the document flow instead of being cut off by the unpin.
   */
  statesEnd: 0.86,
  /** What the dimmed frames rise to through the release. */
  releaseOpacity: 0.68,
  /**
   * Extra upward drift through the release: column, in viewport heights…
   *
   * Small on purpose. A long drift empties the bottom of the stage before the
   * pin lets go, which reads as a hole rather than as a hand-off.
   */
  releaseDrift: 0.03,
  /** …and the line, in px. */
  releaseLift: 10,
  /**
   * Travel of a state's line as it takes and leaves its slot, in px.
   *
   * Large enough that the outgoing line is most of the way out of the clipped
   * slot by the time the incoming one is readable — two multi-line captions
   * crossfading on the same spot are a tangle, not a transition.
   */
  nameTravel: 90,
  /**
   * Presence of a state falls from 1 to 0 between `stateFadeEnd - stateFadeSpan`
   * and `stateFadeEnd` of a state's distance from the current position.
   *
   * `stateFadeSpan = 2 × stateFadeEnd - 1` is load-bearing: it is what makes two
   * neighbouring states sum to exactly 1 everywhere between them, so the swap
   * never dips to an empty slot in the middle. Within that constraint the span
   * is kept short, so each state holds for most of its slice and the exchange is
   * a brief, deliberate move.
   */
  stateFadeEnd: 0.56,
  stateFadeSpan: 0.12,
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

/** Fixed header height in px — anchor scrolling must clear it. */
export const HEADER_OFFSET = 80;
