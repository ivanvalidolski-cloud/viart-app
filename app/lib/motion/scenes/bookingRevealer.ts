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
import { changedOnly, quickScale } from '../setters';

export function createBookingRevealerScene(root: HTMLElement) {
  const story = root.querySelector<HTMLElement>('.wipe-story');
  if (!story) return;

  const pinned = story.querySelector<HTMLElement>('.wipe-pinned');
  const editorial = story.querySelector<HTMLElement>('.wipe-editorial');
  const runway = story.querySelector<HTMLElement>('.wipe-runway');
  const revealer = story.querySelector<HTMLElement>('.wipe-revealer');
  const bars = gsap.utils.toArray<HTMLElement>(story.querySelectorAll('.wipe-bar'));
  if (!pinned || !editorial || !runway || !revealer || !bars.length) return;

  // The cross is centred on its own `left`/`top` by the CSS
  // `translate(-50%, -50%)`. GSAP is about to own this transform for the
  // rotation and the scale, so the centring is restated in its percentage
  // channels — and the pixel channels are zeroed in the same call, because GSAP
  // can only read the stylesheet's percentage translate back as a resolved
  // matrix and would otherwise stack that pixel offset under the percentages.
  gsap.set(revealer, { x: 0, y: 0, xPercent: -50, yPercent: -50 });

  // --- the write pass -------------------------------------------------------
  // Four of the six triggers below drive a value straight off scroll progress.
  // Written as a `gsap.to` inside `onUpdate` that is a fresh tween per property
  // per frame — and on the rotation, which is the one tween here that is
  // deliberately eased and therefore still running when the next frame creates
  // the next one, they stack: several tweens animating `rotation` to several
  // different targets at once, which is what makes the cross stutter and
  // occasionally settle on the wrong angle. One reusable setter each fixes both
  // the stacking and the allocation; `quickTo` keeps the rotation's catch-up.
  const rotateTo = gsap.quickTo(revealer, 'rotation', {
    duration: 0.5,
    ease: 'power1.out',
    overwrite: true,
  });
  const setRevealerLeft = changedOnly<string>((value) => {
    revealer.style.left = value;
  });
  const setRevealerScale = quickScale(revealer);
  const setBarClip = bars.map((bar) =>
    changedOnly<string>((value) => {
      bar.style.clipPath = value;
    }),
  );

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
      rotateTo(progress * REVEALER.rotation);
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
      const left = (REVEALER.clipEdge - REVEALER.clipEdge * progress).toFixed(3);
      const right = (100 - Number(left)).toFixed(3);
      const clip = `polygon(${left}% 0%, ${right}% 0%, ${right}% 100%, ${left}% 100%)`;
      setBarClip.forEach((set) => set(clip));
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
      setRevealerLeft(`${left.toFixed(3)}%`);
    },
  });

  // 6. And the white-out.
  //
  // It ends on `bottom top`, the same edge the two pins release on, so the
  // square reaches full scale in the frame the closing panel takes over the
  // viewport. `bottom bottom` finished the wipe one whole viewport earlier and
  // left that screen pinned, solid and empty — a full screen of blank ivory to
  // scroll past between the end of the animation and the start of the panel.
  ScrollTrigger.create({
    trigger: runway,
    start: 'top 50%',
    end: 'bottom top',
    scrub: REVEALER.scrub,
    invalidateOnRefresh: true,
    onUpdate: ({ progress }) => {
      setRevealerScale(1 + (REVEALER.scaleTo - 1) * progress);
    },
  });

  // The setters above write from callbacks the context never saw — inline
  // styles and a transform cache it has no record of — and the rotation's
  // `quickTo` is a live tween that would keep writing to a detached element.
  return () => {
    gsap.killTweensOf(revealer);
    gsap.killTweensOf(bars);
    gsap.set(revealer, { clearProps: 'transform' });
    revealer.style.removeProperty('left');
    bars.forEach((bar) => bar.style.removeProperty('clip-path'));
  };
}
