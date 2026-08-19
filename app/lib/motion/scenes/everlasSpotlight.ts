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
 *   2. the row of square cards translates leftward along the horizontal axis
 *   3. the active stage's card goes to full opacity, the rest stay dim
 *   4. the active stage's caption crossfades in, replacing the previous one
 *
 * There is no timeline and no ease — the only smoothing is `scrub: 1` plus the
 * CSS opacity/colour transitions.
 *
 * Adapted, twice over. First: four ViART stages instead of ten projects (the
 * source keys every fraction to the list length, so the count is a
 * parameter), ViART media, and the two name colours come from the palette
 * tokens instead of literals.
 *
 * Second: the source's column was a vertical filmstrip with the caption list
 * running down the untouched margin beside it. This build reads as a
 * horizontal line of square cards instead — the composition the ViART build
 * calls for — and a full-width card row leaves no such margin. Sliding all
 * four captions down their own slice of travel, as the source did, now lands
 * them on top of the cards they describe. So the captions no longer travel:
 * one caption box sits in the free band below the row and crossfades between
 * states, and the counter holds a static position instead of sliding down
 * its own column. Which stage is active still drives everything — the card
 * opacity, the caption crossfade, the counter text — from the same single
 * index, so the three cannot drift apart, only now there is nothing left
 * for them to collide with either.
 *
 * Which card is lit is derived, not measured. The source asks each frame for
 * its `getBoundingClientRect()` and writes to it in the same loop, so a scrubbed
 * frame reads layout, writes layout, reads, writes — reflows on every tick,
 * which is the whole of this scene's jitter. This build instead derives the
 * active index from `progress` alone, so the counter, the card and the
 * caption cannot disagree, and the tally holds on the way back up the scrub
 * as well as on the way down.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SPOTLIGHT } from '../tokens';
import { changedOnly } from '../setters';

export function createEverlasSpotlightScene(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>('.spot-scene');
  if (!section) return;

  const counter = section.querySelector<HTMLElement>('.spot-counter');
  const imageRow = section.querySelector<HTMLElement>('.spot-images');
  const images = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('.spot-img'));
  const names = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('.spot-name'));

  if (!counter || !imageRow) return;
  // The counter's denominator, the row and the caption list are all keyed to
  // one total. If the two lists ever disagree, every fraction below would be
  // computed against the wrong one.
  if (!names.length || names.length !== images.length) return;

  const total = names.length;
  const label = (index: number) =>
    `${String(index).padStart(2, '0')}/${String(total).padStart(2, '0')}`;

  // The row is centred by the CSS `translateY(-50%)`. Restating it through
  // GSAP's own percentage channel keeps the centring live: a plain matrix would
  // be read once, in pixels, and go stale the moment the row resizes.
  gsap.set(imageRow, { yPercent: -50 });

  const palette = getComputedStyle(section);
  const activeColor = palette.getPropertyValue('--ivory').trim();
  const idleColor = palette.getPropertyValue('--muted').trim();

  const setRowX = gsap.quickSetter(imageRow, 'x', 'px') as (value: number) => void;
  const setLabel = changedOnly<string>((value) => {
    counter.textContent = value;
  });
  const setImageOpacity = images.map((image) =>
    changedOnly<number>((value) => {
      image.style.opacity = String(value);
    }),
  );
  const setNameOpacity = names.map((name) =>
    changedOnly<number>((value) => {
      name.style.opacity = String(value);
    }),
  );
  const setNameColor = names.map((name) =>
    changedOnly<string>((value) => {
      name.style.color = value;
    }),
  );

  // Cached on refresh — never read inside onUpdate.
  let rowTravel = 0;

  const measure = () => {
    // Negative: the row is far wider than the viewport, so progress
    // multiplied by this value walks it leftward.
    rowTravel = window.innerWidth - imageRow.offsetWidth;
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

      // 2) the row walks left
      setRowX(progress * rowTravel);

      // 3) the active stage's card is the lit one
      setImageOpacity.forEach((set, index) =>
        set(index === active ? 1 : SPOTLIGHT.dimOpacity),
      );

      // 4) the active stage's caption is the visible one — a crossfade, not a
      //    slide, since all four now share the same box.
      names.forEach((_name, index) => {
        setNameOpacity[index](index === active ? 1 : 0);
        setNameColor[index](index === active ? activeColor : idleColor);
      });
    },
  });

  // Everything above is written from a callback the context never sees, so the
  // inline transform/opacity/colour and the plain textContent write are undone
  // by hand before the context reverts.
  return () => {
    gsap.set([imageRow], { clearProps: 'transform' });
    images.forEach((image) => image.style.removeProperty('opacity'));
    names.forEach((name) => {
      name.style.removeProperty('opacity');
      name.style.removeProperty('color');
    });
    counter.textContent = label(1);
  };
}
