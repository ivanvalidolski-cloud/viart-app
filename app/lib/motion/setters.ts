/**
 * Allocation-free per-frame setters.
 *
 * A scrubbed scene writes the same handful of properties sixty times a second.
 * Every `gsap.set` or `gsap.to` in that path allocates a tween, and every read
 * of layout between two writes forces a synchronous reflow. The helpers here
 * exist so a scene's `onUpdate` can stay a pure write pass.
 */

import gsap from 'gsap';

/**
 * `gsap.quickSetter(el, 'scale')` cannot be used.
 *
 * quickSetter resolves the property through the CSS harness's alias table
 * *before* handing it to the setter factory, and that table maps `scale` to the
 * pair `"scaleX,scaleY"`. Nothing downstream understands a comma list, so it
 * falls through to `setAttribute("scaleX,scaleY", …)` and throws
 * `InvalidCharacterError` on every frame the scene updates. Because the throw
 * happens inside a ScrollTrigger callback it aborts the whole update/refresh
 * pass: every trigger after it stops being measured and the pinned scenes below
 * silently lose their spacers.
 *
 * The single-axis names carry no alias, so they resolve to the real transform
 * setter.
 */
export function quickScale(target: HTMLElement) {
  const setScaleX = gsap.quickSetter(target, 'scaleX') as (value: number) => void;
  const setScaleY = gsap.quickSetter(target, 'scaleY') as (value: number) => void;
  return (value: number) => {
    setScaleX(value);
    setScaleY(value);
  };
}

/**
 * Writes only when the value actually changed. Style writes are cheap to issue
 * and expensive to resolve — an unchanged one still invalidates the element.
 */
export function changedOnly<T>(write: (value: T) => void, initial?: T) {
  let last = initial;
  return (value: T) => {
    if (value === last) return;
    last = value;
    write(value);
  };
}
