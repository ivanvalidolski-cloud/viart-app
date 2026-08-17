/**
 * Scene 03 — the EVERLAS stage spotlight (`#everlas`).
 *
 * Adapted from "PrototypeStudio Scroll Animation"
 * https://motionprompts.dev/component/prototypestudio-scroll-animation/
 *
 * One pinned, scrubbed ScrollTrigger over five viewport heights; everything
 * else happens in its `onUpdate` through `gsap.set` off `self.progress`:
 *
 *   1. the counter's text steps `01/04 → 04/04`
 *   2. the counter slides straight down its own travel
 *   3. the tall image column translates upward
 *   4. whichever image crosses the viewport midline goes to full opacity
 *   5. each stage name owns a `1/total` slice: it slides up inside that slice
 *      and holds the ink colour while it is the active one
 *
 * There is no timeline and no ease — the only smoothing is `scrub: 1` plus the
 * two CSS transitions (image opacity, name colour).
 *
 * Adapted: four ViART stages instead of ten projects (the source keys every
 * fraction to the list length, so the count is a parameter), ViART media, and
 * the two name colours come from the palette tokens instead of literals. The
 * geometry is re-measured on refresh rather than once at load, so the travel
 * distances survive a resize — the formulas are unchanged.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SPOTLIGHT } from '../tokens';

export function createEverlasSpotlightScene(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>('.spot-scene');
  if (!section) return;

  const counter = section.querySelector<HTMLElement>('.spot-counter');
  const imageColumn = section.querySelector<HTMLElement>('.spot-images');
  const nameList = section.querySelector<HTMLElement>('.spot-names');
  const images = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('.spot-img'));
  const names = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('.spot-name'));

  if (!counter || !imageColumn || !nameList) return;
  // The counter's denominator, the image column and the name windows are all
  // keyed to one total. If the two lists ever disagree, every fraction below
  // would be computed against the wrong one.
  if (!names.length || names.length !== images.length) return;

  const total = names.length;
  const label = (index: number) =>
    `${String(index).padStart(2, '0')}/${String(total).padStart(2, '0')}`;

  // The column is centred by the CSS `translateX(-50%)`. Restating it through
  // GSAP's own percentage channel keeps the centring live: a plain matrix would
  // be read once, in pixels, and go stale the moment the column resizes.
  gsap.set(imageColumn, { xPercent: -50 });

  const palette = getComputedStyle(section);
  const activeColor = palette.getPropertyValue('--ivory').trim();
  const idleColor = palette.getPropertyValue('--muted').trim();

  // Cached on refresh — never read inside onUpdate.
  let counterTravel = 0;
  let namesTravel = 0;
  let imagesTravel = 0;
  let midline = 0;

  const measure = () => {
    const sectionHeight = section.offsetHeight;
    const padding = parseFloat(getComputedStyle(section).paddingTop) || 0;
    counterTravel = sectionHeight - padding * 2 - counter.offsetHeight;
    namesTravel = sectionHeight - padding * 2 - nameList.offsetHeight;
    // Negative: the column is far taller than the viewport, so progress
    // multiplied by this value walks it upward.
    imagesTravel = window.innerHeight - imageColumn.offsetHeight;
    midline = window.innerHeight / 2;
  };

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${window.innerHeight * SPOTLIGHT.viewports}`,
    pin: true,
    pinSpacing: true,
    scrub: SPOTLIGHT.scrub,
    invalidateOnRefresh: true,
    onRefresh: measure,
    onUpdate: ({ progress }) => {
      // 1) which stage are we on (1-based, clamped to the last one)
      counter.textContent = label(Math.min(Math.floor(progress * total) + 1, total));

      // 2) + 3) the counter walks down, the column walks up
      gsap.set(counter, { y: progress * counterTravel });
      gsap.set(imageColumn, { y: progress * imagesTravel });

      // 4) the image spanning the midline is the lit one
      images.forEach((image) => {
        const rect = image.getBoundingClientRect();
        const lit = rect.top <= midline && rect.bottom >= midline;
        gsap.set(image, { opacity: lit ? 1 : SPOTLIGHT.dimOpacity });
      });

      // 5) each name rides its own slice of the progress
      names.forEach((name, index) => {
        const from = index / total;
        const to = (index + 1) / total;
        const local = Math.max(0, Math.min(1, (progress - from) / (to - from)));
        gsap.set(name, {
          y: -local * namesTravel,
          color: local > 0 && local < 1 ? activeColor : idleColor,
        });
      });
    },
  });

  // Everything above is written from a callback the context never sees, so the
  // inline transform/opacity/colour and the plain textContent write are undone
  // by hand before the context reverts.
  return () => {
    gsap.set([counter, imageColumn, ...images, ...names], {
      clearProps: 'transform,opacity,color',
    });
    counter.textContent = label(1);
  };
}
