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
 * Presence — the one falloff every state-based scene in the second half shares.
 *
 * A state's presence is 1 while the scroll position is near it and ramps to 0
 * as the position moves a `fadeEnd` away. `fadeSpan = 2 × fadeEnd - 1` is
 * load-bearing: it is what makes two neighbouring states sum to exactly 1
 * everywhere between them, so an exchange never dips to an empty slot. The
 * width left over — `fadeEnd - fadeSpan` on each side — is the plateau, the
 * stretch where a state is simply held and read.
 *
 * Both scenes below drive their text and their picture from this one number,
 * which is what makes "text and media are one animation state" a property of
 * the code rather than a thing to keep in sync by hand.
 */
export const presenceOf = (distance: number, fadeEnd: number, fadeSpan: number) =>
  Math.min(1, Math.max(0, (fadeEnd - Math.abs(distance)) / fadeSpan));

/**
 * The laser chapter (`#services`) — three states of one direction, held in a
 * single sticky viewport.
 *
 * Desktop cost: one viewport of stage plus `pinViewports` of scroll, so the
 * whole block is ~1.9 screens — a third of what the capsule scene it replaces
 * charged for the same information. A phone never enters this branch: there the
 * three states are ordinary stacked blocks.
 */
export const LASER = {
  /** Scroll paid *beyond* the sticky viewport, in viewport heights. */
  pinViewports: 0.9,
  scrub: 1,
  /** The states occupy this fraction of the scrub; the rest is the joint. */
  statesEnd: 0.94,
  /** Long plateau: each state is fully readable for ~84% of its slice. */
  fadeEnd: 0.58,
  fadeSpan: 0.16,
  /** Travel of a state's copy as it takes and leaves the slot, in px. */
  copyTravel: 40,
  /** The picture only fades and settles — a large plate must not slide. */
  mediaScaleFrom: 1.05,
} as const;

/**
 * The procedure slides (`.slide-scene`) — image and text as one state.
 *
 * Desktop cost: one viewport of stage plus `pinViewports`, ~2.1 screens for
 * three states. The image is the scene, so the text travels and the picture
 * only fades; both read the same presence, so they cannot disagree.
 */
export const SLIDES = {
  pinViewports: 1.1,
  mobilePinViewports: 0,
  scrub: 1,
  statesEnd: 0.94,
  fadeEnd: 0.62,
  fadeSpan: 0.24,
  copyTravel: 34,
  mediaScaleFrom: 1.06,
} as const;

/** Fixed header height in px — anchor scrolling must clear it. */
export const HEADER_OFFSET = 80;
