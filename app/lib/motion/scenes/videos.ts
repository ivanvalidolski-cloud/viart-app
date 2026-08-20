/**
 * Scene 05 — Videos (`#videos`): three tiles, then Anna + complex.
 *
 * Two states, stepped one gesture at a time. Same two-layer crossfade shape
 * as `equipment.ts` — the trio layer and the dominant-Anna layer are each
 * their own independent composition, not a shared grid reconciling both.
 */

import gsap from 'gsap';
import type Lenis from 'lenis';
import { VIDEOS } from '../tokens';
import { createSteppedScene } from '../steppedScene';

export function createVideosScene(root: HTMLElement, lenis: Lenis) {
  const section = root.querySelector<HTMLElement>('.videos-scene');
  if (!section) return;

  const trio = section.querySelector<HTMLElement>('.videos-layer--trio');
  const anna = section.querySelector<HTMLElement>('.videos-layer--anna');
  if (!trio || !anna) return;

  gsap.set(anna, { opacity: 0, yPercent: 2 });
  gsap.set(trio, { opacity: 1, yPercent: 0 });

  const { duration } = VIDEOS;
  const tween = (target: gsap.TweenTarget, vars: gsap.TweenVars) =>
    gsap.to(target, { duration, ease: 'power2.inOut', overwrite: 'auto', ...vars });

  const toAnna = () => {
    tween(trio, { opacity: 0, yPercent: -2 });
    tween(anna, { opacity: 1, yPercent: 0 });
  };

  const toTrio = () => {
    tween(anna, { opacity: 0, yPercent: 2 });
    tween(trio, { opacity: 1, yPercent: 0 });
  };

  const teardown = createSteppedScene(section, lenis, {
    steps: 2,
    pinViewports: VIDEOS.pinViewports,
    forward: () => ({ run: toAnna, duration }),
    backward: () => ({ run: toTrio, duration }),
  });

  return () => {
    teardown();
    gsap.set([trio, anna], { clearProps: 'opacity,transform' });
  };
}
