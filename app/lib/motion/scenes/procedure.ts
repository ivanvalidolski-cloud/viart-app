/**
 * Scene 03 — Procedure (`#procedure`): stages 01 → 04, a horizontal process
 * track — not four sequential fullscreen card-states.
 *
 * One pinned stage holds three synchronised layers, stepped one gesture per
 * number (`../steppedScene.ts`, the same gesture-gate Directions/Equipment/
 * Videos use — not a scroll-scrubbed track):
 *   - `.procedure-track` — the 01–02–03–04 line itself. It pans horizontally
 *     so the active node's centre always lands at `PROCEDURE.dominantZone`
 *     (35–45vw), with the rest of the sequence still visible on either side.
 *     A progress line/fill rides under the numbers and grows to the active
 *     node.
 *   - `.procedure-active` — the active step's title + explanation, a plain
 *     crossfade between four stationary panels (no separate travel of its
 *     own — only one is ever visible, so it does not need to).
 *   - `.procedure-media-rail` — the active step's photo, a short lateral
 *     move + crossfade (no deep zoom) between four stacked frames.
 *
 * Node width is fixed in CSS (`flex: 0 0 …`) specifically so a node's
 * geometry never changes when it becomes active — only its type scales via
 * `transform`, which does not participate in layout. That is what keeps one
 * rect measurement (below) valid for every step: nothing before it in the
 * flex row ever moves.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';
import { PROCEDURE } from '../tokens';
import { createSteppedScene } from '../steppedScene';

export function createProcedureScene(root: HTMLElement, lenis: Lenis) {
  const section = root.querySelector<HTMLElement>('.procedure-scene');
  if (!section) return;

  const track = section.querySelector<HTMLElement>('.procedure-track');
  const fill = section.querySelector<HTMLElement>('.procedure-track__fill');
  const nodes = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('.procedure-node'));
  const mediaLayers = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('.procedure-media'));
  const textPanels = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('.procedure-active__item'));
  const counter = section.querySelector<HTMLElement>('.procedure-counter');
  if (!track || !fill || nodes.length < 2 || mediaLayers.length !== nodes.length) return;

  const total = nodes.length;
  const label = (index: number) => `${String(index + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}`;

  gsap.set(mediaLayers, { opacity: 0, xPercent: 6 });
  gsap.set(mediaLayers[0], { opacity: 1, xPercent: 0 });
  gsap.set(textPanels, { opacity: 0, yPercent: 4 });
  gsap.set(textPanels[0], { opacity: 1, yPercent: 0 });
  nodes.forEach((node, index) => node.classList.toggle('is-active', index === 0));

  // Node centres in the track's own untransformed coordinate space, so the
  // fill width and the pan target below are both plain offsets from node 0 —
  // stable regardless of which node is currently pinned to the dominant zone.
  let centers: number[] = [];
  // Tracked separately from `steppedScene`'s own internal step counter (it
  // isn't exposed) so a refresh — a window resize, or another part of the
  // page changing height and calling `ScrollTrigger.refresh()` — can restore
  // the pan for whatever step was actually showing, not silently snap the
  // track back to its untransformed rest position.
  let currentStep = 0;

  // The pan itself is anchored to the viewport, not to the track's own box —
  // `PROCEDURE.dominantZone` is a fraction of `innerWidth`, read fresh per
  // step rather than cached, since it must track the viewport, not the page.
  const panFor = (index: number) => {
    const railLeft = track!.getBoundingClientRect().left - (gsap.getProperty(track, 'x') as number);
    return window.innerWidth * PROCEDURE.dominantZone - railLeft - centers[index];
  };

  const measure = () => {
    gsap.set(track, { x: 0 });
    const trackRect = track!.getBoundingClientRect();
    centers = nodes.map((node) => {
      const r = node.getBoundingClientRect();
      return r.left + r.width / 2 - trackRect.left;
    });
    gsap.set(track, { x: panFor(currentStep) });
    gsap.set(fill, { width: centers[currentStep] - centers[0] });
  };
  measure();
  ScrollTrigger.addEventListener('refresh', measure);

  const { duration } = PROCEDURE;

  const goTo = (toIndex: number, fromIndex: number) => {
    const forward = toIndex > fromIndex;

    gsap.to(track, { x: panFor(toIndex), duration, ease: 'power2.inOut', overwrite: 'auto' });
    gsap.to(fill, { width: centers[toIndex] - centers[0], duration, ease: 'power2.inOut', overwrite: 'auto' });
    nodes.forEach((node, index) => node.classList.toggle('is-active', index === toIndex));

    gsap.to(mediaLayers[fromIndex], {
      duration,
      ease: 'power2.inOut',
      opacity: 0,
      xPercent: forward ? -6 : 6,
      overwrite: 'auto',
    });
    gsap.set(mediaLayers[toIndex], { xPercent: forward ? 6 : -6 });
    gsap.to(mediaLayers[toIndex], { duration, ease: 'power2.inOut', opacity: 1, xPercent: 0, overwrite: 'auto' });

    gsap.to(textPanels[fromIndex], {
      duration,
      ease: 'power2.inOut',
      opacity: 0,
      yPercent: forward ? -4 : 4,
      overwrite: 'auto',
    });
    gsap.set(textPanels[toIndex], { yPercent: forward ? 4 : -4 });
    gsap.to(textPanels[toIndex], { duration, ease: 'power2.inOut', opacity: 1, yPercent: 0, overwrite: 'auto' });
  };

  const teardown = createSteppedScene(section, lenis, {
    steps: total,
    pinViewports: PROCEDURE.pinViewports,
    onStepChange: (step) => {
      currentStep = step;
      if (counter) counter.textContent = label(step);
    },
    forward: (from) => ({ run: () => goTo(from + 1, from), duration }),
    backward: (from) => ({ run: () => goTo(from - 1, from), duration }),
  });

  return () => {
    teardown();
    ScrollTrigger.removeEventListener('refresh', measure);
    gsap.set(track, { clearProps: 'transform' });
    gsap.set(fill, { clearProps: 'width' });
    gsap.set(mediaLayers, { clearProps: 'opacity,transform' });
    gsap.set(textPanels, { clearProps: 'opacity,transform' });
    nodes.forEach((node, index) => node.classList.toggle('is-active', index === 0));
    if (counter) counter.textContent = label(0);
  };
}
