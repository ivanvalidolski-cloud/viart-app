/**
 * Cinematic scenes — the hand-built, pinned/scrubbed sequences.
 *
 * Rules that keep scenes from fighting each other and the rest of the page:
 *  - A scene owns every element inside it. No `data-reveal` may appear within
 *    a scene's DOM, or the two layers animate the same node.
 *  - Only one scene may be pinned at a time, and scenes live above the fold.
 *    Their scroll budget comes from SCENE tokens, never from a literal.
 *  - Every trigger declares `invalidateOnRefresh` so distances recompute on
 *    resize, font swap and late image loads instead of going stale.
 *  - Per-frame callbacks never read layout (`innerWidth`/`innerHeight`) — those
 *    are cached on refresh. Reading them per frame forces a reflow each tick.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { EASE, SCENE, STEP } from './tokens';
import { trackScrollSteps } from './steps';

const clamp = gsap.utils.clamp(0, 1);
const interpolate = gsap.utils.interpolate;

/**
 * Scene 01 — "heure bleue": the image wall zooms toward the viewer while the
 * focal frame settles, handing off to the intro copy.
 */
export function createHeureBleueScene(root: HTMLElement) {
  const gallery = root.querySelector<HTMLElement>('.hb-gallery');
  const sideColumns = gsap.utils.toArray<HTMLElement>(
    root.querySelectorAll('.hb-col:not(.hb-col--main)'),
  );
  const focalImage = root.querySelector<HTMLElement>('.hb-img--main img');
  const trigger = root.querySelector<HTMLElement>('.hb-ws');
  if (!gallery || !focalImage || !trigger) return;

  // GSAP owns the transform from here on; the centring lives in the transform
  // it writes, so the CSS `translate(-50%, -50%)` fallback is not fought over.
  gsap.set(gallery, { xPercent: -50, yPercent: -50 });

  const setGalleryScale = gsap.quickSetter(gallery, 'scale') as (value: number) => void;
  const setFocalScale = gsap.quickSetter(focalImage, 'scale') as (value: number) => void;
  const setColumnY = sideColumns.map(
    (column) => gsap.quickSetter(column, 'y', 'px') as (value: number) => void,
  );

  // Cached on refresh instead of read per frame.
  let zoomCeiling: number = SCENE.zoomDesktop;

  ScrollTrigger.create({
    trigger,
    start: 'top bottom',
    end: 'bottom bottom',
    scrub: SCENE.scrub,
    invalidateOnRefresh: true,
    onRefresh: () => {
      zoomCeiling =
        window.innerWidth < SCENE.mobileBreakpoint ? SCENE.zoomMobile : SCENE.zoomDesktop;
    },
    onUpdate: ({ progress }) => {
      setGalleryScale(1 + progress * zoomCeiling);
      setFocalScale(2 - progress * 0.85);
      const columnTravel = progress * 300;
      setColumnY.forEach((set) => set(columnTravel));
    },
  });
}

/**
 * Scene 02 — "voyeur": a pinned four-phase sequence.
 *   0.00–0.25  the frame narrows to a vertical slit, the ground darkens
 *   0.25–0.45  the slit rotates
 *   0.45–0.65  it collapses to nothing while the copy behind slides apart
 *   0.65–0.85  two outro images wipe in from top and bottom
 *   0.90       the outro headline rises line by line
 */
export function createVoyeurScene(scene: HTMLElement) {
  const fgContent = scene.querySelector<HTMLElement>('.vv-fg-content');
  const fgOverlayDark = scene.querySelector<HTMLElement>('.vv-fg-overlay-dark');
  const fgOverlayAccent = scene.querySelector<HTMLElement>('.vv-fg-overlay-accent');
  const bgCopies = gsap.utils.toArray<HTMLElement>(scene.querySelectorAll('.vv-bg-copy'));
  const outroImages = gsap.utils.toArray<HTMLElement>(scene.querySelectorAll('.vv-outro-img'));
  const outroHeadline = scene.querySelector<HTMLElement>('.vv-outro-header h3');

  if (
    !fgContent || !fgOverlayDark || !fgOverlayAccent
    || bgCopies.length < 2 || outroImages.length < 2 || !outroHeadline
  ) return;

  // autoSplit re-measures the headline whenever the line box changes — a resize
  // or a late font swap would otherwise leave the mask cutting mid-glyph.
  // Both flags are declared before the split: onSplit runs synchronously.
  let lines: Element[] = [];
  let linesRevealed = false;

  SplitText.create(outroHeadline, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'vv-line',
    autoSplit: true,
    onSplit: (self) => {
      lines = self.lines;
      // Re-splitting resets inline styles, so the hidden state is reapplied
      // here rather than once at setup.
      gsap.set(lines, { yPercent: linesRevealed ? 0 : 100 });
    },
  });

  ScrollTrigger.create({
    trigger: scene,
    start: 'top top',
    // A function end recomputes on refresh; a literal would freeze the pin
    // distance at the height the page happened to have on first load — the
    // reason the scene drifted after a mobile browser-chrome resize.
    end: () => `+=${window.innerHeight * SCENE.voyeurViewports}`,
    pin: true,
    pinSpacing: true,
    scrub: SCENE.scrub,
    invalidateOnRefresh: true,
    anticipatePin: 1,
    onUpdate: ({ progress }) => {
      const slit = clamp(progress / 0.25);
      const left = interpolate(0, 48, slit);
      const right = interpolate(100, 52, slit);
      gsap.set(fgContent, {
        clipPath: `polygon(${left}% 0%, ${right}% 0%, ${right}% 100%, ${left}% 100%)`,
      });
      gsap.set(fgOverlayDark, { opacity: slit });

      const rotation = clamp((progress - 0.25) / 0.2);
      gsap.set(fgContent, { rotate: interpolate(0, 65, rotation) });

      const collapse = clamp((progress - 0.45) / 0.2);
      gsap.set(fgContent, { scale: interpolate(1, 0, collapse) });
      gsap.set(bgCopies[0], { xPercent: interpolate(0, 100, collapse) });
      gsap.set(bgCopies[1], { xPercent: interpolate(0, -100, collapse) });
      gsap.set(fgOverlayAccent, { opacity: clamp((progress - 0.45) / 0.05) });

      const wipe = clamp((progress - 0.65) / 0.2);
      const topEdge = interpolate(0, 100, wipe);
      const bottomEdge = interpolate(100, 0, wipe);
      gsap.set(outroImages[0], {
        clipPath: `polygon(0% 0%, 100% 0%, 100% ${topEdge}%, 0% ${topEdge}%)`,
      });
      gsap.set(outroImages[1], {
        clipPath: `polygon(0% ${bottomEdge}%, 100% ${bottomEdge}%, 100% 100%, 0% 100%)`,
      });

      if (progress >= 0.9 && !linesRevealed) {
        linesRevealed = true;
        gsap.to(lines, { yPercent: 0, duration: 0.75, stagger: 0.1, ease: EASE.out });
      } else if (progress < 0.9 && linesRevealed) {
        linesRevealed = false;
        gsap.to(lines, { yPercent: 100, duration: 0.25, stagger: -0.05, ease: EASE.out });
      }
    },
  });
}

/**
 * The second half's staged scenes.
 *
 * Every one of them is built on `trackScrollSteps`: a sticky (`position:
 * sticky`, never a GSAP pin) viewport holding a fixed number of states, and a
 * boundary-crossing detector that fires once per state change. What each
 * scene does in response falls into one of two shapes:
 *
 *  - a **crossfade-stack** (Procedure, Process): states are absolutely
 *    stacked panels, and a state change plays one autoplaying timeline that
 *    fades the old panel out and the new one in together — the panel is a
 *    single composition, so its photo and its copy always move as one.
 *  - a **slot swap** (Equipment, Studio, Video): a fixed number of persistent
 *    elements carry a `data-role` (`dominant`, `secondary-N`, `hidden`), and a
 *    state change simply reassigns those roles. The animation is a plain CSS
 *    transition already declared on the element — the same technique the
 *    site's click-driven gallery used before this rebuild — so it finishes on
 *    its own the instant the class changes, with nothing to scrub.
 *
 * Both shapes are declared as ordinary composed states in the CSS at rest, so
 * under `prefers-reduced-motion` (where none of this file runs) the section
 * still renders as a valid static composition — see the matching block in
 * globals.css.
 */

/** 01 — Procedure: context → process → exit, one composition at a time. */
export function createProcedureScene(root: HTMLElement) {
  const scene = root.querySelector<HTMLElement>('.procedure-scene');
  const panels = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('.procedure-panel'));
  if (!scene || panels.length < 2) return;

  gsap.set(panels, { opacity: 0, scale: 1.045 });
  gsap.set(panels[0], { opacity: 1, scale: 1 });

  trackScrollSteps(scene, panels.length, (next, prev) => {
    gsap.killTweensOf([panels[next], panels[prev]]);
    gsap.set(panels[next], { zIndex: 2 });
    gsap.set(panels[prev], { zIndex: 1 });
    gsap.fromTo(
      panels[next],
      { opacity: 0, scale: 1.045 },
      { opacity: 1, scale: 1, duration: STEP.duration, ease: STEP.ease },
    );
    gsap.to(panels[prev], { opacity: 0, duration: STEP.duration * 0.82, ease: STEP.ease });
  });

  return () => gsap.set(panels, { clearProps: 'opacity,transform,zIndex' });
}

/** 03 — Process/Experience: one cinematic poster at a time. */
export function createProcessScene(root: HTMLElement) {
  const scene = root.querySelector<HTMLElement>('.process-scene');
  const posters = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('.process-poster'));
  if (!scene || posters.length < 2) return;

  gsap.set(posters, { opacity: 0, scale: 1.045 });
  gsap.set(posters[0], { opacity: 1, scale: 1 });

  trackScrollSteps(scene, posters.length, (next, prev) => {
    gsap.killTweensOf([posters[next], posters[prev]]);
    gsap.set(posters[next], { zIndex: 2 });
    gsap.set(posters[prev], { zIndex: 1 });
    gsap.fromTo(
      posters[next],
      { opacity: 0, scale: 1.045 },
      { opacity: 1, scale: 1, duration: STEP.duration, ease: STEP.ease },
    );
    gsap.to(posters[prev], { opacity: 0, duration: STEP.duration * 0.82, ease: STEP.ease });
  });

  return () => gsap.set(posters, { clearProps: 'opacity,transform,zIndex' });
}

type SlotRole = 'dominant' | 'secondary-1' | 'secondary-2' | 'secondary-3' | 'hidden';

const slotRoleFor = (distance: number): SlotRole => {
  const magnitude = Math.abs(distance);
  if (magnitude === 0) return 'dominant';
  if (magnitude <= 3) return `secondary-${magnitude}` as SlotRole;
  return 'hidden';
};

/** 02 — Equipment: EVERLAS and TURBO G8 swap which one holds the primary slot. */
export function createEquipmentScene(root: HTMLElement) {
  const scene = root.querySelector<HTMLElement>('.equipment-scene');
  const items = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('.eq-item'));
  if (!scene || items.length !== 2) return;

  trackScrollSteps(scene, items.length, (next) => {
    items.forEach((item, index) => {
      item.dataset.role = index === next ? 'dominant' : 'secondary-1';
    });
  });

  return () => items.forEach((item, index) => { item.dataset.role = index === 0 ? 'dominant' : 'secondary-1'; });
}

/** 04 — Studio gallery: the dominant photo and its secondary sequence. */
export function createStudioScene(root: HTMLElement) {
  const scene = root.querySelector<HTMLElement>('.studio-scene');
  const tiles = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('.studio-tile'));
  if (!scene || tiles.length < 2) return;

  const applyRoles = (active: number) => {
    tiles.forEach((tile, index) => {
      tile.dataset.role = slotRoleFor(index - active);
    });
  };

  applyRoles(0);
  trackScrollSteps(scene, tiles.length, (next) => applyRoles(next));

  return () => applyRoles(0);
}

/** 05 — Studio → Video: the last still reframes into the Video 01 poster. */
export function createStudioVideoHandoffScene(root: HTMLElement) {
  const scene = root.querySelector<HTMLElement>('.studio-video-handoff-scene');
  const states = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('.studio-handoff-state'));
  if (!scene || states.length !== 2) return;

  trackScrollSteps(scene, states.length, (next) => {
    states.forEach((state, index) => {
      state.dataset.role = index === next ? 'dominant' : 'receding';
    });
  });

  return () => states.forEach((state, index) => { state.dataset.role = index === 0 ? 'dominant' : 'receding'; });
}

/** 06 — Video 01 → 02 → 03: the active video keeps the primary slot, the
 * immediate neighbours stay only as directional spatial cues either side. */
export function createVideoScene(root: HTMLElement) {
  const scene = root.querySelector<HTMLElement>('.video-scene');
  const slots = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('.video-slot'));
  if (!scene || slots.length < 2) return;

  const applyRoles = (active: number) => {
    slots.forEach((slot, index) => {
      const wasDominant = slot.dataset.role === 'dominant';
      slot.dataset.role = index === active ? 'dominant' : index === active - 1 ? 'previous' : index === active + 1 ? 'next' : 'hidden';
      // A video playing off in the secondary layer would keep its audio
      // going while the frame it belongs to is no longer the one on screen.
      if (wasDominant && index !== active) slot.querySelector('video')?.pause();
    });
  };

  applyRoles(0);
  trackScrollSteps(scene, slots.length, (next) => applyRoles(next));

  return () => applyRoles(0);
}

/**
 * 07 — Video 03 → Complexes. Not a staged scene: a single fade triggered
 * once, the same self-completing shape as everything above it, handing off
 * to the existing Complexes section (`.first-visit-chapter`) without a new
 * composition of its own.
 */
export function createVideoComplexesBridge(root: HTMLElement) {
  const bridge = root.querySelector<HTMLElement>('.video-complexes-bridge');
  // `.video-frame` is tweened, not `.video-slot` — the slot already carries a
  // CSS `transform: translate(...) scale(...)` for its dominant/secondary
  // position, and an inline transform GSAP writes would replace that
  // centring outright rather than combine with it.
  const lastVideoFrame = root.querySelector<HTMLElement>('.video-slot:last-child .video-frame');
  if (!bridge || !lastVideoFrame) return;

  ScrollTrigger.create({
    trigger: bridge,
    start: 'top bottom',
    end: 'bottom center',
    invalidateOnRefresh: true,
    onEnter: () => gsap.to(lastVideoFrame, { opacity: 0.24, scale: 0.92, duration: STEP.duration, ease: STEP.ease }),
    onLeaveBack: () => gsap.to(lastVideoFrame, { opacity: 1, scale: 1, duration: STEP.duration, ease: STEP.ease }),
  });

  return () => gsap.set(lastVideoFrame, { clearProps: 'opacity,transform' });
}
