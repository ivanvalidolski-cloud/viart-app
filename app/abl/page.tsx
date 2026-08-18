'use client';

/**
 * ABL Basketball School — prototype of two sections only: Hero and
 * Training / process. Nothing else from the home page is built here.
 *
 * Every factual statement on this page comes from the confirmed list and
 * nothing else: group size, frequency, the absence of a beginner/advanced
 * split, and the three coaches. There are no results, no guarantees, no
 * achievements and no named methodology, because none were supplied.
 */

import { useRef } from 'react';
import { AblMedia, type SafeZone } from './AblMedia';
import { useAblMotion } from '../lib/motion/useAblMotion';

/**
 * Regions the hero photograph has to keep clear of the headline.
 *
 * On desktop the headline crosses into the media's lower left by ~17% of the
 * frame's width at 1440px and ~24% at 1920px. The subject's zone starts at 44%
 * from the left, so at least 20% of clearance is left; the ball sits in the
 * upper left, well above the overlapped band. On mobile there is no overlap at
 * all — the headline sits below the frame.
 */
const heroSafeZones: SafeZone[] = [
  { label: 'Игрок / голова', inset: '6% 8% 18% 44%' },
  { label: 'Мяч', inset: '8% 60% 68% 16%' },
];

/** The training frame carries no overlay at all — its caption sits outside. */
const trainingSafeZones: SafeZone[] = [
  { label: 'Тренер и игроки', inset: '12% 18% 22% 20%' },
  { label: 'Мяч', inset: '52% 24% 26% 58%' },
];

export default function AblPrototypePage() {
  const page = useRef<HTMLElement>(null);
  useAblMotion(page);

  return (
    <main className="abl-site" ref={page}>
      {/* ==================================================================
          1. Hero
          ================================================================== */}
      <section className="abl-hero abl-shell" aria-labelledby="abl-hero-title">
        <div className="abl-hero-brand" data-reveal="">
          <span className="abl-hero-mark">ABL</span>
          <span className="abl-label">Basketball School</span>
        </div>

        <AblMedia
          className="abl-hero-media"
          slot="HERO / 01"
          brief="Баскетбольное действие: игрок в атаке, мяч в кадре. Субъект справа от центра, левая нижняя четверть кадра остаётся пустой под заголовок."
          alt="Игрок ABL в атаке на тренировке"
          focal="68% 30%"
          safe={heroSafeZones}
          sizes="(max-width: 860px) 100vw, 58vw"
          priority
          reveal="media"
        />

        <h1 className="abl-display abl-hero-headline" id="abl-hero-title" data-reveal="">
          <span className="abl-display-line">Школа</span>
          <span className="abl-display-line">баскетбола</span>
        </h1>

        <div className="abl-hero-foot" data-reveal="">
          <p className="abl-lead">
            Группы по 7–15 человек, две-три тренировки в неделю. Без отдельного деления на
            новичков и продолжающих.
          </p>
          <a className="abl-cta" href="#training">
            Как проходит тренировка
            <span aria-hidden="true">↓</span>
          </a>
        </div>

        <ul className="abl-hero-meta" data-reveal="">
          <li>
            <b>7–15</b> человек в группе
          </li>
          <li>
            <b>2–3</b> тренировки в неделю
          </li>
          <li>
            <b>3</b> тренера на площадке
          </li>
        </ul>
      </section>

      {/* ==================================================================
          2. Training / process
          ================================================================== */}
      <section
        className="abl-training abl-shell"
        id="training"
        aria-labelledby="abl-training-title"
      >
        <p className="abl-label abl-training-label" data-reveal="">
          Тренировочный процесс
        </p>

        <h2
          className="abl-display abl-training-heading"
          id="abl-training-title"
          data-reveal="mask"
        >
          <span className="abl-display-line">Как устроена</span>
          <span className="abl-display-line">тренировка</span>
        </h2>

        <p className="abl-training-copy" data-reveal="">
          На площадке одновременно работают три тренера: двое ведут баскетбол и тактику,
          третий отвечает за общую физическую подготовку. Группа занимается в полном
          составе — отдельного деления на новичков и продолжающих нет.
        </p>

        <figure className="abl-training-figure" data-reveal="media">
          <AblMedia
            className="abl-training-media"
            slot="TRAINING / 02"
            brief="Реальный тренировочный процесс: взаимодействие тренера и игроков в работе. Смысловой центр кадра — контакт тренера с ребёнком."
            alt="Тренер ABL работает с группой на тренировке"
            focal="50% 42%"
            safe={trainingSafeZones}
            sizes="(max-width: 860px) 100vw, 50vw"
          />
          <figcaption>Тренировка в полном составе группы</figcaption>
        </figure>

        <dl className="abl-facts" data-reveal="group">
          <div data-reveal-item="">
            <dt>Группа</dt>
            <dd>7–15 человек</dd>
          </div>
          <div data-reveal-item="">
            <dt>Периодичность</dt>
            <dd>2–3 тренировки в неделю</dd>
          </div>
          <div data-reveal-item="">
            <dt>Состав</dt>
            <dd>Без деления на новичков и продолжающих</dd>
          </div>
          <div data-reveal-item="">
            <dt>Тренеры</dt>
            <dd>Двое — баскетбол и тактика, один — ОФП</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
