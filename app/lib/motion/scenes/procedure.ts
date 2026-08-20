/**
 * Scene 03 — Procedure (`#procedure`): stages 01 → 04.
 *
 * Four states, stepped one gesture per number — replaces the old scrubbed
 * "journey" track (Procedure and Studio sharing one transform) now that
 * Procedure and Gallery are two functionally different sections again. Each
 * stage is one card holding its number, its photo and its explanation
 * together, so the three never separate into different attention zones —
 * stepping is a plain crossfade between whole cards.
 */

import gsap from 'gsap';
import type Lenis from 'lenis';
import { PROCEDURE } from '../tokens';
import { createSteppedScene } from '../steppedScene';

export function createProcedureScene(root: HTMLElement, lenis: Lenis) {
  const section = root.querySelector<HTMLElement>('.procedure-scene');
  if (!section) return;

  const cards = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('.procedure-card'));
  const counter = section.querySelector<HTMLElement>('.procedure-counter');
  if (cards.length < 2) return;

  const total = cards.length;
  const label = (index: number) => `${String(index + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}`;

  gsap.set(cards, { opacity: 0, yPercent: 3 });
  gsap.set(cards[0], { opacity: 1, yPercent: 0 });

  const { duration } = PROCEDURE;

  const show = (toIndex: number, fromIndex: number) => {
    const forward = toIndex > fromIndex;
    gsap.to(cards[fromIndex], {
      duration,
      ease: 'power2.inOut',
      opacity: 0,
      yPercent: forward ? -3 : 3,
      overwrite: 'auto',
    });
    gsap.set(cards[toIndex], { yPercent: forward ? 3 : -3 });
    gsap.to(cards[toIndex], { duration, ease: 'power2.inOut', opacity: 1, yPercent: 0, overwrite: 'auto' });
  };

  const teardown = createSteppedScene(section, lenis, {
    steps: total,
    pinViewports: PROCEDURE.pinViewports,
    onStepChange: (step) => {
      if (counter) counter.textContent = label(step);
    },
    forward: (from) => ({ run: () => show(from + 1, from), duration }),
    backward: (from) => ({ run: () => show(from - 1, from), duration }),
  });

  return () => {
    teardown();
    gsap.set(cards, { clearProps: 'opacity,transform' });
    if (counter) counter.textContent = label(0);
  };
}
