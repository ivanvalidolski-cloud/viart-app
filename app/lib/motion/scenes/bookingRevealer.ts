/**
 * Scene 08 — the wipe from the reviews into the final booking screen.
 *
 * Adapted from "Epic Scroll Story — Rotating Clip-Path Cross that Scales Up to
 * Wipe the Screen"
 * https://motionprompts.dev/component/epic-scroll-anims-scrolltrigger-gsap/
 *
 * A small cross — two clipped bars, one rotated 90° — sits over a pinned
 * editorial block. Across the runway it turns a full 360°, its clip-path opens
 * from a thin plus into a solid square, it drifts from left-of-centre to centre,
 * and finally scales thirteen times to fill the viewport, handing straight off
 * to the closing panel underneath it, which is painted the same colour.
 *
 * Six triggers, in the source's order, with the source's exact windows: two pins
 * sharing the runway's end, the eased rotation (the only motion that keeps
 * GSAP's default tween, giving it a trailing catch-up), and the clip / drift /
 * scale writes at `duration: 0`, `ease: "none"` so they bind tightly to scroll.
 *
 * Adapted: the palette. The demo wipes to bone white over a dark block; here the
 * cross and the closing panel are the same warm off-white against the studio's
 * near-black, which is what makes the handoff seamless in either scheme.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { REVEALER } from '../tokens';

export function createBookingRevealerScene(root: HTMLElement) {
  const story = root.querySelector<HTMLElement>('.wipe-story');
  if (!story) return;

  const pinned = story.querySelector<HTMLElement>('.wipe-pinned');
  const editorial = story.querySelector<HTMLElement>('.wipe-editorial');
  const runway = story.querySelector<HTMLElement>('.wipe-runway');
  const revealer = story.querySelector<HTMLElement>('.wipe-revealer');
  const bars = gsap.utils.toArray<HTMLElement>(story.querySelectorAll('.wipe-bar'));
  if (!pinned || !editorial || !runway || !revealer || !bars.length) return;

  // The cross is centred on its own `left` by the CSS `translate(-50%, 0%)`.
  // GSAP is about to own this transform for the rotation and the scale, so the
  // centring is restated in its percentage channel rather than left to be read
  // back out of a matrix in pixels.
  gsap.set(revealer, { xPercent: -50, yPercent: 0 });

  // 1 + 2. Both pins end at the same point, so the editorial block and the
  // cross stay locked together for the whole reveal. `pinSpacing: false` — the
  // runway already provides the scroll.
  ScrollTrigger.create({
    trigger: pinned,
    start: 'top top',
    endTrigger: runway,
    end: 'bottom top',
    pin: true,
    pinSpacing: false,
    invalidateOnRefresh: true,
  });

  ScrollTrigger.create({
    trigger: editorial,
    start: 'top top',
    endTrigger: runway,
    end: 'bottom top',
    pin: true,
    pinSpacing: false,
    invalidateOnRefresh: true,
  });

  // 3. A full turn. No scrub: the default `gsap.to` ease is deliberate here and
  // is what gives the rotation its slight lag behind the scroll.
  ScrollTrigger.create({
    trigger: pinned,
    start: 'top top',
    endTrigger: editorial,
    end: 'bottom bottom',
    invalidateOnRefresh: true,
    onUpdate: ({ progress }) => {
      gsap.to(revealer, { rotation: progress * REVEALER.rotation });
    },
  });

  // 4. The plus opens into a filled square: each bar's clip widens from the
  // 45–55% centre column out to the full box, and because one bar is rotated
  // the pair closes up solid.
  ScrollTrigger.create({
    trigger: pinned,
    start: 'top top',
    endTrigger: editorial,
    end: 'bottom bottom',
    invalidateOnRefresh: true,
    onUpdate: ({ progress }) => {
      const left = REVEALER.clipEdge - REVEALER.clipEdge * progress;
      const right = 100 - left;
      gsap.to(bars, {
        clipPath: `polygon(${left}% 0%, ${right}% 0%, ${right}% 100%, ${left}% 100%)`,
        ease: 'none',
        duration: 0,
      });
    },
  });

  // 5. Drift to horizontal centre. The smoothing is the scrub, not the tween.
  ScrollTrigger.create({
    trigger: editorial,
    start: 'top top',
    end: 'bottom 50%',
    scrub: REVEALER.scrub,
    invalidateOnRefresh: true,
    onUpdate: ({ progress }) => {
      const left = REVEALER.driftFrom + (REVEALER.driftTo - REVEALER.driftFrom) * progress;
      gsap.to(revealer, { left: `${left}%`, ease: 'none', duration: 0 });
    },
  });

  // 6. And the white-out.
  ScrollTrigger.create({
    trigger: runway,
    start: 'top 50%',
    end: 'bottom bottom',
    scrub: REVEALER.scrub,
    invalidateOnRefresh: true,
    onUpdate: ({ progress }) => {
      gsap.to(revealer, {
        scale: 1 + (REVEALER.scaleTo - 1) * progress,
        ease: 'none',
        duration: 0,
      });
    },
  });

  // The four progress-driven triggers create their tweens from callbacks the
  // context never saw. Three resolve on the next tick anyway; the rotation is
  // eased and would keep writing to a detached element, so both targets are
  // killed by hand.
  return () => {
    gsap.killTweensOf(revealer);
    gsap.killTweensOf(bars);
    gsap.set([revealer, ...bars], { clearProps: 'transform,left,clipPath' });
  };
}
