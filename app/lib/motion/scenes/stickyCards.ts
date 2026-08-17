/**
 * Scene 07 — the complexes deck (`#promo`).
 *
 * Adapted from "Sticky Stacked Cards Scroll Reveal (GSAP + Lenis)"
 * https://motionprompts.dev/component/sticky-cards-ashfall-rebuild-js/
 *
 * The cards all occupy the same box inside a container that clips them. The
 * front card shrinks to half size and tilts ten degrees while its photograph
 * counter-zooms, and the next card slides up from `y: 100%` to cover it — one
 * swap per viewport height of scroll, fully scrubbed, entirely reversible.
 *
 * The three tweens per transition, their shared integer timeline position, the
 * `duration: 1, ease: "none"` linearity, `scrub: 0.5` and the
 * `+= innerHeight * (cards - 1)` end are the source's. The card count is the
 * source's own `totalCards`, here the four ViART complexes. The last card never
 * shrinks — it is what the pin releases on.
 */

import gsap from 'gsap';
import { STICKY_CARDS } from '../tokens';

export function createStickyCardsScene(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>('.deck-scene');
  if (!section) return;

  const cards = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('.deck-card'));
  const images = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('.deck-card img'));
  if (cards.length < 2 || images.length !== cards.length) return;

  const total = cards.length;

  cards.forEach((card, index) => {
    // Every card but the front one waits one container-height below, hidden by
    // the container's own overflow.
    gsap.set(card, { y: index === 0 ? '0%' : '100%', scale: 1, rotation: 0 });
    gsap.set(images[index], { scale: 1 });
  });

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${window.innerHeight * (total - 1)}`,
      pin: true,
      scrub: STICKY_CARDS.scrub,
      invalidateOnRefresh: true,
    },
  });

  for (let index = 0; index < total - 1; index += 1) {
    // All three land at the same integer position, so the transitions run
    // back-to-back with no gap and each maps to exactly one viewport height.
    timeline.to(
      cards[index],
      {
        scale: STICKY_CARDS.cardScale,
        rotation: STICKY_CARDS.cardRotation,
        duration: 1,
        ease: 'none',
      },
      index,
    );
    timeline.to(
      images[index],
      { scale: STICKY_CARDS.imageScale, duration: 1, ease: 'none' },
      index,
    );
    timeline.to(cards[index + 1], { y: '0%', duration: 1, ease: 'none' }, index);
  }
}
