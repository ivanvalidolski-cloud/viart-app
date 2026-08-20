/**
 * Scene 02 — Directions (`#services`): Laser, then Massage.
 *
 * Two full states, stepped one gesture at a time — the same two-layer
 * crossfade shape as `equipment.ts`/`videos.ts`. Laser's own entrance is the
 * transfer scene's job (`transfer.ts` fades in `.directions-media__frame
 * --laser` and `.directions-panel--laser` specifically, inside this layer,
 * as the hero's traveling image lands); this scene only owns the whole-layer
 * Laser ⇄ Massage swap once Laser has settled.
 */

import gsap from 'gsap';
import type Lenis from 'lenis';
import { DIRECTIONS } from '../tokens';
import { createSteppedScene } from '../steppedScene';

export function createDirectionsScene(root: HTMLElement, lenis: Lenis) {
  const section = root.querySelector<HTMLElement>('.directions-scene');
  if (!section) return;

  const laser = section.querySelector<HTMLElement>('.directions-direction--laser');
  const massage = section.querySelector<HTMLElement>('.directions-direction--massage');
  if (!laser || !massage) return;

  gsap.set(massage, { opacity: 0, yPercent: 2 });
  gsap.set(laser, { opacity: 1, yPercent: 0 });

  const { duration } = DIRECTIONS;
  const tween = (target: gsap.TweenTarget, vars: gsap.TweenVars) =>
    gsap.to(target, { duration, ease: 'power2.inOut', overwrite: 'auto', ...vars });

  const toMassage = () => {
    tween(laser, { opacity: 0, yPercent: -2 });
    tween(massage, { opacity: 1, yPercent: 0 });
  };

  const toLaser = () => {
    tween(massage, { opacity: 0, yPercent: 2 });
    tween(laser, { opacity: 1, yPercent: 0 });
  };

  const teardown = createSteppedScene(section, lenis, {
    steps: 2,
    pinViewports: DIRECTIONS.pinViewports,
    forward: () => ({ run: toMassage, duration }),
    backward: () => ({ run: toLaser, duration }),
  });

  return () => {
    teardown();
    gsap.set([laser, massage], { clearProps: 'opacity,transform' });
  };
}
