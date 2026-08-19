'use client';

/**
 * The video wall — portrait clips from the studio.
 *
 * Three properties this component exists to hold:
 *
 *  1. **Portrait stays portrait.** Every frame is `9 / 16` and the file inside
 *     it is 1080×1920, so `object-fit: cover` has nothing to crop. Nothing here
 *     ever lays a vertical clip into a 16:9 plate.
 *  2. **The clips are equal.** They are laid out in one row at one size — there
 *     is no hero clip and no pair of thumbnails beside it.
 *  3. **Playback belongs to the reader.** Nothing plays, pauses, seeks or
 *     unmutes because of the scroll position. The only things that start a clip
 *     are its play button and the native controls; selecting another clip
 *     pauses the one that was running, because two soundtracks at once is not a
 *     choice anybody made.
 *
 * `preload="none"` is deliberate and load-bearing: these files are tens of
 * megabytes with their `moov` atom at the end, so `metadata` costs a fetch of
 * nearly the whole clip for every visitor, most of whom never press play. The
 * poster is what the wall shows until they do.
 *
 * Below the three-up breakpoint the wall is one player plus an explicit row of
 * selectors — the same clips, chosen rather than scrolled to.
 */

import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';

export type StudioVideo = {
  src: string;
  poster: string;
  title: string;
  meta: string;
  /** Description of the poster frame, for the selector thumbnails. */
  alt: string;
};

type PlayState = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error';

export function VideoWall({ videos }: { videos: StudioVideo[] }) {
  const [active, setActive] = useState(0);
  const [states, setStates] = useState<PlayState[]>(() => videos.map(() => 'idle'));
  const refs = useRef<Array<HTMLVideoElement | null>>([]);

  const setState = useCallback((index: number, state: PlayState) => {
    setStates((current) => {
      if (current[index] === state) return current;
      const next = current.slice();
      next[index] = state;
      return next;
    });
  }, []);

  const pauseOthers = useCallback((keep: number) => {
    refs.current.forEach((video, index) => {
      if (!video || index === keep || video.paused) return;
      video.pause();
    });
  }, []);

  const play = useCallback(
    (index: number) => {
      const video = refs.current[index];
      if (!video) return;
      pauseOthers(index);
      if (states[index] === 'error') video.load();
      if (states[index] === 'ended') video.currentTime = 0;
      video.muted = false;
      setState(index, 'loading');
      video
        .play()
        .then(() => setState(index, 'playing'))
        .catch(() => setState(index, 'error'));
    },
    [pauseOthers, setState, states],
  );

  const select = useCallback(
    (index: number) => {
      pauseOthers(index);
      setActive(index);
    },
    [pauseOthers],
  );

  const single = videos.length < 2;

  return (
    <div className={`reel-wall ${single ? 'reel-wall--single' : ''}`}>
      <div className="reel-row">
        {videos.map((video, index) => {
          const state = states[index];
          const isBusy = state === 'loading';
          return (
            <article
              className={`reel-card ${index === active ? 'is-active' : ''}`}
              key={video.src}
            >
              <div className="reel-frame">
                <video
                  ref={(element) => {
                    refs.current[index] = element;
                  }}
                  src={video.src}
                  poster={video.poster}
                  playsInline
                  preload="none"
                  controls={state === 'playing' || state === 'paused'}
                  onPlay={() => setState(index, 'playing')}
                  onPlaying={() => setState(index, 'playing')}
                  onWaiting={() => setState(index, 'loading')}
                  onPause={(event) => {
                    if (event.currentTarget.ended) return;
                    setState(index, 'paused');
                  }}
                  onEnded={() => setState(index, 'ended')}
                  onError={() => setState(index, 'error')}
                />

                {state !== 'playing' && state !== 'paused' && state !== 'error' && (
                  <button
                    type="button"
                    className="reel-play"
                    onClick={() => play(index)}
                    disabled={isBusy}
                    aria-label={
                      state === 'ended'
                        ? `Посмотреть снова: ${video.title}`
                        : `Воспроизвести видео: ${video.title}`
                    }
                  >
                    <span aria-hidden="true">
                      {isBusy ? '···' : state === 'ended' ? '↻' : '▶'}
                    </span>
                  </button>
                )}

                {state === 'error' && (
                  <div className="reel-error" role="alert">
                    <p>Видео временно недоступно.</p>
                    <button type="button" className="text-button" onClick={() => play(index)}>
                      Попробовать снова <span aria-hidden="true">↻</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="reel-meta">
                <p className="reel-title">{video.title}</p>
                <p className="tech-label reel-note">{video.meta}</p>
              </div>
            </article>
          );
        })}
      </div>

      {!single && (
        <div className="reel-select" role="tablist" aria-label="Выбор видео">
          {videos.map((video, index) => (
            <button
              type="button"
              role="tab"
              key={video.src}
              className={`reel-thumb ${index === active ? 'is-active' : ''}`}
              aria-selected={index === active}
              onClick={() => select(index)}
            >
              <Image src={video.poster} alt={video.alt} fill sizes="96px" className="cover-image" />
              <span className="tech-label">{String(index + 1).padStart(2, '0')}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
