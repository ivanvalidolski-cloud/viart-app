/**
 * Scene 03 — the EVERLAS stage spotlight (`#everlas`).
 *
 * Adapted from "PrototypeStudio Scroll Animation"
 * https://motionprompts.dev/component/prototypestudio-scroll-animation/
 *
 * One pinned, scrubbed ScrollTrigger over five viewport heights; everything
 * else happens in its `onUpdate` off `self.progress`:
 *
 *   1. the counter's text steps `01/04 → 04/04`
 *   2. the counter slides straight down its own travel
 *   3. the tall image column translates upward
 *   4. the active stage's image goes to full opacity, the rest stay dim
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
 *
 * Which image is lit is derived, not measured. The source asks each frame for
 * its `getBoundingClientRect()` and writes to it in the same loop, so a scrubbed
 * frame reads layout, writes layout, reads, writes — four synchronous reflows
 * per tick, which is the whole of this scene's jitter.
 *
 * It is derived from the *stage*, not from the geometry. Testing which frame
 * spans the viewport midline only agrees with the counter and the name list
 * while the frames sit close together: under `@media (max-width: 1000px)` the
 * column opens to `gap: 25svh`, which leaves more than a third of the scrub with
 * the counter on `02/04`, the second name lit, and no image at full opacity at
 * all. One index now feeds the counter, the frame and the name, so the four
 * states cannot drift apart — and because it is a pure function of `progress`,
 * they hold on the way back up as well. On a desktop column the two rules agree
 * to within half a percent of the scrub, which is why the scene still looks the
 * way it did.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SPOTLIGHT } from '../tokens';
import { changedOnly } from '../setters';

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

  const setCounterY = gsap.quickSetter(counter, 'y', 'px') as (value: number) => void;
  const setColumnY = gsap.quickSetter(imageColumn, 'y', 'px') as (value: number) => void;
  const setNameY = names.map(
    (name) => gsap.quickSetter(name, 'y', 'px') as (value: number) => void,
  );
  const setLabel = changedOnly<string>((value) => {
    counter.textContent = value;
  });
  const setImageOpacity = images.map((image) =>
    changedOnly<number>((value) => {
      image.style.opacity = String(value);
    }),
  );
  const setNameColor = names.map((name) =>
    changedOnly<string>((value) => {
      name.style.color = value;
    }),
  );

  // Cached on refresh — never read inside onUpdate.
  let counterTravel = 0;
  let namesTravel = 0;
  let imagesTravel = 0;

  const measure = () => {
    const sectionHeight = section.offsetHeight;
    const padding = parseFloat(getComputedStyle(section).paddingTop) || 0;
    counterTravel = sectionHeight - padding * 2 - counter.offsetHeight;
    namesTravel = sectionHeight - padding * 2 - nameList.offsetHeight;
    // Negative: the column is far taller than the viewport, so progress
    // multiplied by this value walks it upward.
    imagesTravel = window.innerHeight - imageColumn.offsetHeight;
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
      // 1) which stage are we on — the one index the other three read
      const active = Math.min(Math.floor(progress * total), total - 1);
      setLabel(label(active + 1));

      // 2) + 3) the counter walks down, the column walks up
      setCounterY(progress * counterTravel);
      setColumnY(progress * imagesTravel);

      // 4) the active stage's frame is the lit one
      setImageOpacity.forEach((set, index) =>
        set(index === active ? 1 : SPOTLIGHT.dimOpacity),
      );

      // 5) each name rides its own slice of the progress. The slice is what
      //    moves it; the stage is what colours it — the old `0 < local < 1`
      //    test left every name dim at both ends of the scrub, while the
      //    counter was reading `01/04` and `04/04`.
      names.forEach((_name, index) => {
        const from = index / total;
        const to = (index + 1) / total;
        const local = Math.max(0, Math.min(1, (progress - from) / (to - from)));
        setNameY[index](-local * namesTravel);
        setNameColor[index](index === active ? activeColor : idleColor);
      });
    },
  });

  // Everything above is written from a callback the context never sees, so the
  // inline transform/opacity/colour and the plain textContent write are undone
  // by hand before the context reverts.
  return () => {
    gsap.set([counter, imageColumn, ...images, ...names], { clearProps: 'transform' });
    images.forEach((image) => image.style.removeProperty('opacity'));
    names.forEach((name) => name.style.removeProperty('color'));
    counter.textContent = label(1);
  };
}
