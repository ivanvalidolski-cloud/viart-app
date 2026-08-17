/**
 * Scene 02 — the two-directions capsule swap (`#services`).
 *
 * Adapted from "Capsules Animated Sticky Columns"
 * https://motionprompts.dev/component/capsules-animated-columns/
 *
 * The mechanics are the source's, transcribed: one trigger pins the section
 * over five viewport heights while a second, deliberately longer trigger (six
 * viewport heights) watches progress and fires two discrete phases at 0.33 and
 * 0.66. Nothing here is scrubbed — the phases are time-based `gsap.to` tweens
 * at the source's 0.75s, default ease, fired once per threshold crossing and
 * mirrored on the way back up.
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

export function createCapsulesScene(root: HTMLElement) {
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
  gsap.set(col2, { xPercent: 100, yPercent: 0, opacity: 1, scale: 1 });
  gsap.set(col3, { xPercent: 100, yPercent: 100 });
  gsap.set(col4, { xPercent: 100, yPercent: 100 });
  gsap.set(col1, { opacity: 1, scale: 1 });
  gsap.set(photo1, { scale: 1 });
  gsap.set(photo2, { scale: 1.25 });
  gsap.set(capsule2, { clipPath: CAPSULES.clipClosed });
  gsap.set(linesA, { y: '0%' });
  gsap.set(linesB, { y: '-125%' });

  const { duration, textDelay } = CAPSULES;

  const phaseOneIn = () => {
    gsap.to(col1, { opacity: 0, scale: 0.75, duration });
    gsap.to(col2, { xPercent: 0, duration });
    gsap.to(col3, { yPercent: 0, duration });
    gsap.to(photo1, { scale: 1.25, duration });
    gsap.to(capsule2, { clipPath: CAPSULES.clipOpen, duration });
    gsap.to(photo2, { scale: 1, duration });
  };

  const phaseOneOut = () => {
    gsap.to(col1, { opacity: 1, scale: 1, duration });
    gsap.to(col2, { xPercent: 100, duration });
    gsap.to(col3, { yPercent: 100, duration });
    gsap.to(photo1, { scale: 1, duration });
    gsap.to(capsule2, { clipPath: CAPSULES.clipClosed, duration });
    gsap.to(photo2, { scale: 1.25, duration });
  };

  const phaseTwoIn = () => {
    gsap.to(col2, { opacity: 0, scale: 0.75, duration });
    gsap.to(col3, { xPercent: 0, duration });
    gsap.to(col4, { yPercent: 0, duration });
    gsap.to(linesA, { y: '-125%', duration });
    gsap.to(linesB, { y: '0%', duration, delay: textDelay });
  };

  const phaseTwoOut = () => {
    gsap.to(col2, { opacity: 1, scale: 1, duration });
    gsap.to(col3, { xPercent: 100, duration });
    gsap.to(col4, { yPercent: 100, duration });
    gsap.to(linesA, { y: '0%', duration, delay: textDelay });
    gsap.to(linesB, { y: '-125%', duration });
  };

  // --- 3. the two triggers --------------------------------------------------
  // The pin carries no animation; the progress trigger carries no pin and runs
  // longer, so both thresholds land inside the pinned range.
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${window.innerHeight * CAPSULES.pinViewports}`,
    pin: true,
    pinSpacing: true,
    invalidateOnRefresh: true,
  });

  // Lives outside the trigger, inside this closure — never at module scope, or
  // a remount would resume from a phase the columns are not actually in.
  let currentPhase = 0;

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${window.innerHeight * CAPSULES.progressViewports}`,
    invalidateOnRefresh: true,
    onUpdate: ({ progress }) => {
      // Ordered so a single frame that crosses both thresholds resolves fully
      // in either direction; each transition still fires exactly once.
      if (progress >= CAPSULES.phaseOne && currentPhase === 0) {
        currentPhase = 1;
        phaseOneIn();
      }
      if (progress >= CAPSULES.phaseTwo && currentPhase === 1) {
        currentPhase = 2;
        phaseTwoIn();
      }
      if (progress < CAPSULES.phaseTwo && currentPhase === 2) {
        currentPhase = 1;
        phaseTwoOut();
      }
      if (progress < CAPSULES.phaseOne && currentPhase === 1) {
        currentPhase = 0;
        phaseOneOut();
      }
    },
  });

  // The context reverts the tweens and the triggers; the splits are DOM the
  // context never made, so they are undone here — after the tweens targeting
  // the generated spans have been killed.
  return () => {
    gsap.killTweensOf([linesA, linesB]);
    splits.forEach((split) => split.revert());
  };
}
