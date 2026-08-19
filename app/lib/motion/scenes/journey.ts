/**
 * Scene 03 — the journey track (`#everlas`): Procedure and Studio on one
 * horizontal line.
 *
 * One pinned, scrubbed ScrollTrigger over `JOURNEY.viewports` viewport
 * heights drives a single `x` translate across a track that holds, in order,
 * the four square Procedure cards and the Studio's portrait frames. Nothing
 * else moves independently — Procedure does not end before Studio begins,
 * because there is only one section and one transform. Which chapter is
 * "active" (the counter/caption band vs. the Studio label) is derived from
 * `progress` against `JOURNEY.procedureFraction`, crossfaded over a short
 * band either side of the split so the hand-off itself has no seam.
 *
 * The runway's last `JOURNEY.resolveSpan` grows the trailing Studio card and
 * settles the others toward a dim resting opacity — the multi-image line
 * resolving onto one dominant vertical frame right where the pin releases
 * into First Visit's own portrait video, rather than stopping mid-row and
 * cutting to a new section.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { JOURNEY } from '../tokens';
import { changedOnly, quickScale } from '../setters';

export function createJourneyScene(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>('.journey-scene');
  if (!section) return;

  const counter = section.querySelector<HTMLElement>('.journey-counter');
  const studioLabel = section.querySelector<HTMLElement>('.journey-studio-label');
  const track = section.querySelector<HTMLElement>('.journey-track');
  const procedureCards = gsap.utils.toArray<HTMLElement>(
    section.querySelectorAll('.journey-card--procedure'),
  );
  const studioCards = gsap.utils.toArray<HTMLElement>(
    section.querySelectorAll('.journey-card--studio'),
  );
  const captionBox = section.querySelector<HTMLElement>('.journey-captions');
  const captions = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('.journey-caption'));

  if (!counter || !studioLabel || !track || !captionBox) return;
  if (!procedureCards.length || procedureCards.length !== captions.length) return;
  if (!studioCards.length) return;

  const dominant = studioCards[studioCards.length - 1];
  const restCards = studioCards.slice(0, -1);

  const total = procedureCards.length;
  const label = (index: number) =>
    `${String(index).padStart(2, '0')}/${String(total).padStart(2, '0')}`;

  const setTrackX = gsap.quickSetter(track, 'x', 'px') as (value: number) => void;
  const setLabel = changedOnly<string>((value) => {
    counter.textContent = value;
  });
  const setCounterOpacity = gsap.quickSetter(counter, 'opacity') as (value: number) => void;
  const setStudioLabelOpacity = gsap.quickSetter(studioLabel, 'opacity') as (
    value: number,
  ) => void;
  const setCaptionBoxOpacity = gsap.quickSetter(captionBox, 'opacity') as (
    value: number,
  ) => void;
  const setProcedureOpacity = procedureCards.map((card) =>
    changedOnly<number>((value) => {
      card.style.opacity = String(value);
    }),
  );
  const setCaptionOpacity = captions.map((caption) =>
    changedOnly<number>((value) => {
      caption.style.opacity = String(value);
    }),
  );
  const setRestOpacity = restCards.map((card) => gsap.quickSetter(card, 'opacity') as (
    value: number,
  ) => void);
  const setDominantScale = quickScale(dominant);

  // Cached on refresh — never read inside onUpdate.
  let trackTravel = 0;
  const measure = () => {
    trackTravel = window.innerWidth - track.offsetWidth;
  };

  const { procedureFraction: split, resolveSpan, finalCardGrowth, dimOpacity } = JOURNEY;
  const bandHalf = 0.04;
  const resolveStart = 1 - resolveSpan;

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${window.innerHeight * JOURNEY.viewports}`,
    pin: true,
    pinSpacing: true,
    scrub: JOURNEY.scrub,
    invalidateOnRefresh: true,
    onRefresh: measure,
    onUpdate: ({ progress }) => {
      // 1) the whole track walks left, procedure and studio together
      setTrackX(progress * trackTravel);

      // 2) which procedure stage is active, only meaningful before the split
      const procedureT = gsap.utils.clamp(0, 1, progress / split);
      const active = Math.min(Math.floor(procedureT * total), total - 1);
      setLabel(label(active + 1));
      setProcedureOpacity.forEach((set, index) =>
        set(index === active ? 1 : dimOpacity),
      );
      captions.forEach((_caption, index) => setCaptionOpacity[index](index === active ? 1 : 0));

      // 3) counter/caption band vs. the studio label — one short crossfade at
      //    the split, not a snap
      const studioT = gsap.utils.clamp(
        0,
        1,
        (progress - (split - bandHalf)) / (bandHalf * 2),
      );
      setCounterOpacity(1 - studioT);
      setCaptionBoxOpacity(1 - studioT);
      setStudioLabelOpacity(studioT);

      // 4) the runway's last stretch resolves the line onto one dominant frame
      const resolveT = gsap.utils.clamp(0, 1, (progress - resolveStart) / resolveSpan);
      setDominantScale(1 + (finalCardGrowth - 1) * resolveT);
      setRestOpacity.forEach((set) => set(1 - resolveT * (1 - dimOpacity)));
    },
  });

  // Everything above is written from a callback the context never sees, so the
  // inline transform/opacity and the plain textContent write are undone by
  // hand before the context reverts.
  return () => {
    gsap.set([track, dominant, ...restCards], { clearProps: 'transform,opacity' });
    procedureCards.forEach((card) => card.style.removeProperty('opacity'));
    captions.forEach((caption) => caption.style.removeProperty('opacity'));
    counter.style.removeProperty('opacity');
    studioLabel.style.removeProperty('opacity');
    captionBox.style.removeProperty('opacity');
    counter.textContent = label(1);
  };
}
