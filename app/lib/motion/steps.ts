/**
 * The step driver — the one mechanism every staged scene in the second half
 * shares.
 *
 * A staged scene is a sticky viewport (CSS `position: sticky`, not a GSAP
 * pin) holding `count` states. Scrolling through the container is native the
 * whole time — nothing calls `ScrollTrigger`'s `pin`, so there is no captured
 * scroll and no snap. `trackScrollSteps` only watches the container's own
 * scroll progress to decide which state is nearest, and calls `onStep` the
 * instant that nearest state changes.
 *
 * `onStep` is expected to play an autoplaying GSAP timeline of fixed
 * duration (`STEP.duration`) — never a scrub. That timeline finishes on its
 * own; a reader who stops scrolling mid-gesture still sees the transition
 * complete. A fast flick that crosses more than one boundary still only ever
 * calls `onStep` with the nearest resulting index, once — the composition
 * settles at the state the reader scrolled to, not at every state in between.
 */

import { ScrollTrigger } from 'gsap/ScrollTrigger';

export type StepHandle = {
  /** The container's current nearest state, kept in sync on every refresh. */
  getActive: () => number;
  teardown: () => void;
};

export function trackScrollSteps(
  container: HTMLElement,
  count: number,
  onStep: (next: number, prev: number) => void,
): StepHandle {
  let active = 0;

  const nearest = (progress: number) =>
    Math.min(count - 1, Math.max(0, Math.round(progress * (count - 1))));

  const trigger = ScrollTrigger.create({
    trigger: container,
    start: 'top top',
    end: 'bottom bottom',
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const next = nearest(self.progress);
      if (next === active) return;
      const prev = active;
      active = next;
      onStep(next, prev);
    },
    // A refresh (resize, late image, font swap) re-measures the container;
    // it must not replay a transition, only resync which state is current.
    onRefresh: (self) => {
      active = nearest(self.progress);
    },
  });

  return {
    getActive: () => active,
    teardown: () => trigger.kill(),
  };
}
