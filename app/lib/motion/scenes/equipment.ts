/**
 * Scene 04 — Equipment (`#everlas`): EVERLAS, then TURBO G8.
 *
 * Two full states, stepped one gesture at a time. Each state is its own
 * absolutely-stacked layer with its own grid (media column, then text column
 * for EVERLAS; text column, then media column for TURBO G8) so the two
 * states read as a rebalanced composition rather than the same layout twice
 * — a plain opacity crossfade between two independent layers, no shared
 * slots to reconcile.
 */

import gsap from 'gsap';
import type Lenis from 'lenis';
import { EQUIPMENT } from '../tokens';
import { createSteppedScene } from '../steppedScene';

export function createEquipmentScene(root: HTMLElement, lenis: Lenis) {
  const section = root.querySelector<HTMLElement>('.equipment-scene');
  if (!section) return;

  const everlas = section.querySelector<HTMLElement>('.equipment-layer--everlas');
  const turbo = section.querySelector<HTMLElement>('.equipment-layer--turbo');
  if (!everlas || !turbo) return;

  gsap.set(turbo, { opacity: 0, yPercent: 2 });
  gsap.set(everlas, { opacity: 1, yPercent: 0 });

  const { duration } = EQUIPMENT;
  const tween = (target: gsap.TweenTarget, vars: gsap.TweenVars) =>
    gsap.to(target, { duration, ease: 'power2.inOut', overwrite: 'auto', ...vars });

  const toTurbo = () => {
    tween(everlas, { opacity: 0, yPercent: -2 });
    tween(turbo, { opacity: 1, yPercent: 0 });
  };

  const toEverlas = () => {
    tween(turbo, { opacity: 0, yPercent: 2 });
    tween(everlas, { opacity: 1, yPercent: 0 });
  };

  const teardown = createSteppedScene(section, lenis, {
    steps: 2,
    pinViewports: EQUIPMENT.pinViewports,
    forward: () => ({ run: toTurbo, duration }),
    backward: () => ({ run: toEverlas, duration }),
  });

  return () => {
    teardown();
    gsap.set([everlas, turbo], { clearProps: 'opacity,transform' });
  };
}
