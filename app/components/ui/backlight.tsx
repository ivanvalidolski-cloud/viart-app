/**
 * Magic UI — Backlight
 * https://magicui.design/docs/components/backlight
 *
 * The official implementation, unchanged: a blur, a saturation lift, and the
 * source graphic composited back over the result, so the child keeps its edges
 * and only spills light around itself.
 *
 * It sits behind the master video here, on a warm plate rather than on the video
 * itself — the glow should read as studio light behind the frame, and filtering
 * a playing video would cost a repaint per frame for no visible gain.
 */

import { useId, type ReactElement } from 'react';

type BacklightProps = {
  children?: ReactElement;
  className?: string;
  blur?: number;
};

export function Backlight({ blur = 20, children, className }: BacklightProps) {
  const id = useId();

  return (
    <div className={className}>
      <svg width="0" height="0" aria-hidden="true">
        <filter id={id} y="-50%" x="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blurred" />
          <feColorMatrix type="saturate" in="blurred" values="4" />
          <feComposite in="SourceGraphic" operator="over" />
        </filter>
      </svg>

      <div style={{ filter: `url(#${id})` }}>{children}</div>
    </div>
  );
}
