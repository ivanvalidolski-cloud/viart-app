/**
 * Scene 04 — the procedure slides (`.slide-scene`).
 *
 * Three states of how a visit runs — подготовка, лазер, массаж — one sticky
 * viewport, `SLIDES.pinViewports` of scroll on top of it: about 2.1 viewports
 * for the whole block, against the four it used to charge.
 *
 * A state is a picture and a caption, and both are one thing here. They read
 * the same `presenceOf` value off the same derived position, so the order of a
 * state is always the same three beats:
 *
 *   a short joint enter   both layers come up together over `fadeSpan`
 *   a plateau            presence is flat at 1 — this is the reading stretch,
 *                        and it is the longest part of a state's slice
 *   a joint exit         both layers leave together, as the next pair arrives
 *
 * The picture is the scene at this size (~64vw), so it only fades and settles
 * out of `mediaScaleFrom`; the caption is what travels. Neither is split, and
 * neither has a timeline of its own to drift on.
 *
 * On a phone the scene is not built: the three states are stacked blocks that
 * the reader scrolls past, which is the same content over a fifth of the scroll.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { quickScale } from '../setters';
import { presenceOf, SLIDES } from '../tokens';

export function createProcedureSlidesScene(root: HTMLElement, { wide }: { wide: boolean }) {
  if (!wide) return;

  const section = root.querySelector<HTMLElement>('.slide-scene');
  if (!section) return;

  const stage = section.querySelector<HTMLElement>('.slide-stage');
  const frames = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('.slide-frame'));
  const captions = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('.slide-caption'));
  if (!stage || !frames.length || frames.length !== captions.length) return;

  const total = frames.length;

  const setFrameOpacity = frames.map((el) => gsap.quickSetter(el, 'opacity') as (v: number) => void);
  const setFrameScale = frames.map((el) => quickScale(el));
  const setCaptionOpacity = captions.map(
    (el) => gsap.quickSetter(el, 'opacity') as (v: number) => void,
  );
  const setCaptionY = captions.map((el) => gsap.quickSetter(el, 'y', 'px') as (v: number) => void);

  const apply = (progress: number) => {
    const states = Math.min(1, progress / SLIDES.statesEnd);
    const position = states * (total - 1);

    for (let index = 0; index < total; index += 1) {
      const distance = position - index;
      const near = presenceOf(distance, SLIDES.fadeEnd, SLIDES.fadeSpan);
      setFrameOpacity[index](near);
      setFrameScale[index](1 + (1 - near) * (SLIDES.mediaScaleFrom - 1));
      setCaptionOpacity[index](near);
      setCaptionY[index](-gsap.utils.clamp(-1, 1, distance) * SLIDES.copyTravel);
    }
  };

  ScrollTrigger.create({
    trigger: stage,
    start: 'top top',
    end: () => `+=${window.innerHeight * SLIDES.pinViewports}`,
    pin: true,
    pinSpacing: true,
    scrub: SLIDES.scrub,
    invalidateOnRefresh: true,
    onRefresh: (self) => apply(self.progress),
    onUpdate: (self) => apply(self.progress),
  });

  return () => {
    gsap.set([...frames, ...captions], { clearProps: 'transform' });
    [...frames, ...captions].forEach((element) => element.style.removeProperty('opacity'));
  };
}
