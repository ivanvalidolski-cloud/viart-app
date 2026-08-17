/**
 * Declarative reveal system.
 *
 * Adding an animation to an ordinary section is a markup change, not a code
 * change. Three attributes, nothing else:
 *
 *   data-reveal              fade + rise when the element enters the viewport
 *   data-reveal="media"      fade only — for large images, which must not slide
 *   data-reveal="mask"       headline reveal, line by line, from behind a mask
 *   data-reveal="group"      staggers this element's [data-reveal-item] children
 *   data-reveal-item         a member of a group's stagger chain
 *   data-reveal-delay="0.2"  optional extra delay in seconds
 *
 * Every reveal fires once. Nothing here pins, scrubs or moves on a timeline —
 * that is the job of a scene (see `scenes.ts`), and the two layers must never
 * animate the same element.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DURATION, EASE, REVEAL } from './tokens';

const delayOf = (element: Element) => Number(element.getAttribute('data-reveal-delay')) || 0;

/**
 * Entrances that need no text measurement. Built synchronously before the first
 * paint: the hidden state must be applied in the same frame the markup lands,
 * or the content shows, hides, and fades back in — a worse flash than having no
 * animation at all.
 *
 * Must be called inside a gsap.context() or matchMedia branch so that teardown
 * is automatic.
 */
export function createEntranceReveals(scope: HTMLElement) {
  const plain = gsap.utils.toArray<HTMLElement>(
    scope.querySelectorAll('[data-reveal=""], [data-reveal="media"]'),
  );
  const groups = gsap.utils.toArray<HTMLElement>(scope.querySelectorAll('[data-reveal="group"]'));

  // --- single elements -----------------------------------------------------
  // One batched trigger instead of one per element: elements entering together
  // animate together, and the browser keeps a single observer.
  if (plain.length) {
    gsap.set(plain, { opacity: 0 });
    plain.forEach((element) => {
      if (element.dataset.reveal !== 'media') gsap.set(element, { y: REVEAL.distance });
    });

    ScrollTrigger.batch(plain, {
      start: REVEAL.start,
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: DURATION.base,
          ease: EASE.out,
          stagger: REVEAL.stagger,
          delay: delayOf(batch[0]),
          overwrite: 'auto',
        });
      },
    });
  }

  // --- staggered groups ----------------------------------------------------
  groups.forEach((group) => {
    const items = gsap.utils.toArray<HTMLElement>(group.querySelectorAll('[data-reveal-item]'));
    if (!items.length) return;

    gsap.set(items, { opacity: 0, y: REVEAL.distance });
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: DURATION.base,
      ease: EASE.out,
      stagger: REVEAL.stagger,
      delay: delayOf(group),
      scrollTrigger: { trigger: group, start: REVEAL.start, once: true },
    });
  });
}

/**
 * Headline line masks. Split separately and later, once the webfont has landed
 * — splitting against the fallback face measures the wrong line boxes and the
 * mask ends up cutting through glyphs.
 *
 * autoSplit re-measures on resize and on font swap; returning the tween from
 * onSplit lets GSAP kill and rebuild it cleanly on every re-split.
 */
export function createMaskReveals(scope: HTMLElement) {
  const masks = gsap.utils.toArray<HTMLElement>(scope.querySelectorAll('[data-reveal="mask"]'));

  masks.forEach((headline) => {
    SplitText.create(headline, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'reveal-line',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 100,
          duration: DURATION.slow,
          ease: EASE.out,
          stagger: REVEAL.stagger,
          delay: delayOf(headline),
          scrollTrigger: { trigger: headline, start: REVEAL.start, once: true },
        }),
    });
  });
}

/**
 * Reduced-motion path: content is simply present. No triggers are created, so
 * there is nothing to tear down and nothing that can leave an element hidden.
 */
export function revealInstantly(scope: HTMLElement) {
  const all = scope.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-item]');
  gsap.set(all, { opacity: 1, y: 0, clearProps: 'transform,opacity' });
}
