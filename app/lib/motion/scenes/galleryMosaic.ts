/**
 * Scene 05 — the gallery mosaic (`#gallery`).
 *
 * Adapted from "Mask Reveal On Scroll (3×3 clip-path mosaic image reveal)"
 * https://motionprompts.dev/component/mask-reveal/
 *
 * Every cell is layered with nine identical full-cover copies of its
 * photograph, each clipped to one cell of a 3×3 grid. The nine polygons start
 * as zero-area points pinned to their own cell's top-left corner and grow to
 * the full cell, cascading along the grid's five anti-diagonals — so the
 * picture unfolds corner to corner. One-shot, per row, no scrub and no pin.
 *
 * The polygon tables, the wave grouping, the `index * 0.125` wave offsets, the
 * 0.5s `power2.out` tween, the 0.1s within-wave stagger and the `top 75%` row
 * trigger are all the source's. Adapted: the nine masks take their picture from
 * a `--mosaic-src` custom property on the cell instead of seventeen hand-written
 * classes, and cells with no picture still get masks and still animate — which
 * is what makes the row read as a gappy editorial grid rather than a filled one.
 */

import gsap from 'gsap';
import { MOSAIC } from '../tokens';

/** Collapsed zero-area points, each at its cell's top-left corner. */
const INITIAL_CLIP_PATHS = [
  'polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)',
  'polygon(33% 0%, 33% 0%, 33% 0%, 33% 0%)',
  'polygon(66% 0%, 66% 0%, 66% 0%, 66% 0%)',
  'polygon(0% 33%, 0% 33%, 0% 33%, 0% 33%)',
  'polygon(33% 33%, 33% 33%, 33% 33%, 33% 33%)',
  'polygon(66% 33%, 66% 33%, 66% 33%, 66% 33%)',
  'polygon(0% 66%, 0% 66%, 0% 66%, 0% 66%)',
  'polygon(33% 66%, 33% 66%, 33% 66%, 33% 66%)',
  'polygon(66% 66%, 66% 66%, 66% 66%, 66% 66%)',
];

/** The full cells — the 0.5% overrun on the right/bottom edges hides seams. */
const FINAL_CLIP_PATHS = [
  'polygon(0% 0%, 33.5% 0%, 33.5% 33%, 0% 33.5%)',
  'polygon(33% 0%, 66.5% 0%, 66.5% 33%, 33% 33.5%)',
  'polygon(66% 0%, 100% 0%, 100% 33%, 66% 33.5%)',
  'polygon(0% 33%, 33.5% 33%, 33.5% 66%, 0% 66.5%)',
  'polygon(33% 33%, 66.5% 33%, 66.5% 66%, 33% 66.5%)',
  'polygon(66% 33%, 100% 33%, 100% 66%, 66% 66.5%)',
  'polygon(0% 66%, 33.5% 66%, 33.5% 100%, 0% 100%)',
  'polygon(33% 66%, 66.5% 66%, 66.5% 100%, 33% 100%)',
  'polygon(66% 66%, 100% 66%, 100% 100%, 66% 100%)',
];

/** The five anti-diagonals of the grid, top-left to bottom-right. */
const WAVES = [
  ['.m-1'],
  ['.m-2', '.m-4'],
  ['.m-3', '.m-5', '.m-7'],
  ['.m-6', '.m-8'],
  ['.m-9'],
];

const MASK_COUNT = 9;

export function createGalleryMosaicScene(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>('.mosaic-scene');
  if (!section) return;

  const injected: HTMLElement[] = [];

  gsap.utils.toArray<HTMLElement>(section.querySelectorAll('.mosaic-row')).forEach((row) => {
    gsap.utils.toArray<HTMLElement>(row.querySelectorAll('.mosaic-cell')).forEach((cell) => {
      // `createElement`/`appendChild` are plain DOM the context cannot revert,
      // so a second pass must not stack a second set of nine on the first —
      // every index below depends on there being exactly nine.
      if (!cell.querySelector('.mask')) {
        for (let index = 1; index <= MASK_COUNT; index += 1) {
          const mask = document.createElement('div');
          mask.classList.add('mask', `m-${index}`);
          cell.appendChild(mask);
          injected.push(mask);
        }
      }

      const masks = cell.querySelectorAll<HTMLElement>('.mask');
      masks.forEach((mask, index) => gsap.set(mask, { clipPath: INITIAL_CLIP_PATHS[index] }));

      const timeline = gsap.timeline({
        scrollTrigger: { trigger: row, start: MOSAIC.start },
      });

      WAVES.forEach((wave, waveIndex) => {
        timeline.to(
          wave.map((selector) => cell.querySelector(selector)),
          {
            // Resolve each tile's real index in the cell's mask list, so a tile
            // maps to its own cell whatever order the wave lists it in.
            clipPath: (_index: number, element: Element) =>
              FINAL_CLIP_PATHS[Array.from(masks).indexOf(element as HTMLElement)],
            duration: MOSAIC.duration,
            ease: MOSAIC.ease,
            stagger: MOSAIC.stagger,
          },
          waveIndex * MOSAIC.waveOffset,
        );
      });
    });
  });

  return () => injected.forEach((mask) => mask.remove());
}
