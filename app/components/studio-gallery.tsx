'use client';

/**
 * «Студия в деталях» — the horizontal gallery.
 *
 * Replaces the clip-path mosaic. A mosaic showed nine ninths of a picture and
 * told the reader nothing about any of them; this shows one frame at a time,
 * large, with its own index and caption, and the next frame is already visible
 * at the edge so the row reads as something to move through.
 *
 * Every input path reaches the same scroll position, and none of them is hover:
 *
 *   trackpad / wheel   native horizontal scrolling — Lenis passes a purely
 *                      horizontal gesture through untouched (it returns before
 *                      `preventDefault` when `deltaY === 0`)
 *   touch              native swipe with the browser's own momentum, plus the
 *                      visible edge of the next card as the affordance
 *   mouse drag         pointer events, mouse only — touch keeps its native
 *                      momentum, which a JS drag would replace with a worse one
 *   keyboard           the track is focusable and the two controls are ordinary
 *                      buttons; ← and → step while the track has focus
 *
 * The active index is derived from the scroll position rather than tracked
 * alongside it, so a drag, a swipe, a flick and a button press cannot disagree
 * about which frame the reader is on.
 */

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

export type StudioShot = {
  src: string;
  alt: string;
  caption: string;
  /** Where `cover` should hold the frame — every source here is portrait. */
  focus: string;
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function StudioGallery({ shots, label }: { shots: StudioShot[]; label: string }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  /** The card nearest the middle of the track's own viewport. */
  const readActive = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const middle = track.scrollLeft + track.clientWidth / 2;
    let nearest = 0;
    let best = Infinity;
    Array.from(track.children).forEach((child, index) => {
      const card = child as HTMLElement;
      const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - middle);
      if (distance < best) {
        best = distance;
        nearest = index;
      }
    });
    setActive(nearest);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // rAF-throttled: the handler reads layout, and a native scroll fires it far
    // more often than a frame.
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        readActive();
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    readActive();
    return () => {
      if (frame) cancelAnimationFrame(frame);
      track.removeEventListener('scroll', onScroll);
    };
  }, [readActive]);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[index] as HTMLElement | undefined;
    if (!card) return;
    track.scrollTo({
      left: card.offsetLeft + card.offsetWidth / 2 - track.clientWidth / 2,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }, []);

  const step = useCallback(
    (direction: number) => goTo(Math.min(shots.length - 1, Math.max(0, active + direction))),
    [active, goTo, shots.length],
  );

  // --- mouse drag ----------------------------------------------------------
  // Mouse only. A pointer drag on touch would fight the browser's own inertia,
  // and on a pen it is not the expected gesture either.
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;
    drag.current = { x: event.clientX, left: track.scrollLeft, moved: false };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    const state = drag.current;
    if (!track || !state) return;
    const dx = event.clientX - state.x;
    if (!state.moved) {
      if (Math.abs(dx) < 4) return;
      state.moved = true;
      // Capture only once the gesture is a drag, so a plain click on a card
      // still behaves like a click.
      track.setPointerCapture(event.pointerId);
      track.classList.add('is-dragging');
    }
    track.scrollLeft = state.left - dx;
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || !drag.current) return;
    if (drag.current.moved && track.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }
    track.classList.remove('is-dragging');
    drag.current = null;
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    }
  };

  return (
    <div className="shot-gallery">
      <div
        className="shot-track"
        ref={trackRef}
        role="group"
        aria-label={label}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
      >
        {shots.map((shot, index) => (
          <figure
            className={`shot-card ${index === active ? 'is-active' : ''}`}
            key={shot.src + index}
            aria-current={index === active ? 'true' : undefined}
          >
            <div className="shot-frame">
              <Image
                src={shot.src}
                alt={shot.alt}
                fill
                sizes="(max-width: 899px) 86vw, 48vw"
                className="cover-image"
                style={{ objectPosition: shot.focus }}
                draggable={false}
              />
            </div>
            <figcaption className="shot-caption">
              <span className="tech-label shot-index">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="shot-text">{shot.caption}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="shot-controls">
        <p className="tech-label shot-counter" aria-live="polite">
          {String(active + 1).padStart(2, '0')} / {String(shots.length).padStart(2, '0')}
        </p>
        <div className="shot-buttons">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={active === 0}
            aria-label="Предыдущий кадр"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={active === shots.length - 1}
            aria-label="Следующий кадр"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
