'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useViartMotion } from './lib/motion/useViartMotion';
import { usePointerFine } from './lib/usePointerFine';
import { AnimatedBeam } from './components/ui/animated-beam';
import { Backlight } from './components/ui/backlight';
import { BorderBeam } from './components/ui/border-beam';
import { InteractiveHoverButton, InteractiveHoverLink } from './components/ui/interactive-hover-button';
import { Lens } from './components/ui/lens';
import Magnet from './components/ui/magnet';
import { NumberTicker } from './components/ui/number-ticker';
import { TextAnimate } from './components/ui/text-animate';

const bookingUrl = 'https://n1177049.yclients.com';
const priceTabs = ['Лазерная эпиляция', 'Комплексы эпиляции', 'Аппаратный массаж'];

type PriceGender = 'women' | 'men';

const laserPrices: Record<PriceGender, Array<{ title: string; items: Array<{ name: string; price: string }> }>> = {
  women: [
    {
      title: 'Лицо и шея',
      items: [
        { name: 'Верхняя губа', price: '700 ₽' },
        { name: 'Подбородок', price: '700 ₽' },
        { name: 'Щёки', price: '800 ₽' },
        { name: 'Бакенбарды', price: '700 ₽' },
        { name: 'Лицо полностью', price: '2 500 ₽' },
      ],
    },
    {
      title: 'Руки и тело',
      items: [
        { name: 'Подмышки', price: '1 100 ₽' },
        { name: 'Руки до локтя', price: '1 300 ₽' },
        { name: 'Руки полностью', price: '2 500 ₽' },
        { name: 'Плечи', price: '1 500 ₽' },
        { name: 'Живот', price: '1 200 ₽' },
        { name: 'Спина — верх или низ', price: '1 300 ₽' },
        { name: 'Спина полностью', price: '2 500 ₽' },
        { name: 'Грудь', price: '600 ₽' },
      ],
    },
    {
      title: 'Интимные зоны',
      items: [
        { name: 'Бикини классик', price: '2 500 ₽' },
        { name: 'Глубокое бикини', price: '3 500 ₽' },
        { name: 'Бразильское бикини', price: '4 300 ₽' },
        { name: 'Бикини + ягодицы', price: '4 900 ₽' },
      ],
    },
    {
      title: 'Ноги',
      items: [
        { name: 'Голень', price: '2 000 ₽' },
        { name: 'Бёдра', price: '2 000 ₽' },
        { name: 'Ноги до колена', price: '2 500 ₽' },
        { name: 'Ноги полностью', price: '3 500 ₽' },
      ],
    },
  ],
  men: [
    {
      title: 'Голова и шея',
      items: [{ name: 'Борода / шея', price: '2 500 ₽' }],
    },
    {
      title: 'Торс, руки и спина',
      items: [
        { name: 'Спина полностью', price: '3 300 ₽' },
        { name: 'Грудь + живот', price: '3 500 ₽' },
        { name: 'Плечи', price: '1 500 ₽' },
      ],
    },
    { title: 'Интимные зоны', items: [] },
    { title: 'Ноги', items: [] },
  ],
};

const epilationComplexes: Record<PriceGender, Array<{ name: string; detail: string; price: string; firstVisitPrice: string }>> = {
  women: [
    { name: '«Начальный»', detail: 'Тотальное бикини + подмышки', price: '3 300 ₽', firstVisitPrice: '2 310 ₽' },
    { name: '«Супер»', detail: 'Тотальное бикини + подмышки + голени + колени', price: '4 800 ₽', firstVisitPrice: '3 360 ₽' },
    { name: '«Популярный»', detail: 'Тотальное бикини + подмышки + ноги полностью', price: '5 900 ₽', firstVisitPrice: '4 130 ₽' },
    { name: '«Основной»', detail: 'Тотальное бикини + подмышки + ноги полностью + руки до локтя', price: '6 900 ₽', firstVisitPrice: '4 830 ₽' },
  ],
  men: [
    { name: '«Начальный»', detail: 'Лицо + подмышки', price: '4 800 ₽', firstVisitPrice: '3 360 ₽' },
    { name: '«Популярный»', detail: 'Пах полностью + подмышки', price: '5 000 ₽', firstVisitPrice: '3 500 ₽' },
    { name: '«Супер»', detail: 'Спина полностью + грудь или живот + подмышки', price: '6 500 ₽', firstVisitPrice: '4 550 ₽' },
    { name: '«Основной»', detail: 'Спина полностью + пах полностью + подмышки', price: '7 300 ₽', firstVisitPrice: '5 110 ₽' },
  ],
};

const massagePrices = [
  { name: 'Вибромассаж TURBO G8 „Коррекция фигуры“', price: 'Первое посещение — 1500 ₽ / далее — 2500 ₽' },
  { name: 'Комплекс „Упругие ягодицы“', price: '2 500 ₽' },
  { name: 'Комплекс „Плоский живот“', price: '2 500 ₽' },
  { name: 'Вибромассаж Turbosculpt, 2 зоны', price: '2 500 ₽' },
];

type Review = { name: string; rating: number; text: string; date?: string };
type VideoState = 'poster' | 'preview' | 'loading' | 'playing' | 'paused' | 'ended' | 'error';

const reviews: Review[] = [
  {
    name: 'Аделина К.',
    rating: 5,
    date: '26 июля 2025',
    text: 'Осталась в восторге от посещения этого салона! Персонал очень дружелюбный, вежливый и профессиональный — мастер подробно объяснила процедуру, дала рекомендации по уходу за кожей и сделала всё аккуратно и безболезненно. Чувствуется, что здесь работают...',
  },
  {
    name: 'Lilia Kristyan',
    rating: 5,
    date: '25 марта 2025',
    text: 'Была на лазерное процедуру к мастеру Анна хочу сказать очень внимательная приятная девушка знает свою работу процедура прошла успешно безболезненно благодарю её большое. 🌸 записалась повторно теперь только сюда всем советую ещё хочу сказать что девушка на...',
  },
  {
    name: 'Любовь Найденова',
    rating: 5,
    date: '10 июня 2025',
    text: 'Роскошный мастер Анна! Пришла на лазерную эпиляцию, переживала, что будет чувствительно. Анна меня успокоила, подобрала комфортный режим и мы просто час проболтали нон-стоп! Берегите свои кадры, такие чудесные мастера – это навес золота! Очень рекомендую этот салон! Спасибо, что открылись в моем доме🥰',
  },
  {
    name: 'Natahabaklakov',
    rating: 5,
    date: '11 марта 2025',
    text: 'Не просто хорошее место, а очень хорошее место! Невероятно приветливые и профессиональные девочки, которые встречают и провожают вас с улыбкой) мастера профессионалы своего дела, которое они делают с любовью к вам, к вашему здоровью! Дают советы и...',
  },
  {
    name: 'Алина Б.',
    rating: 5,
    date: '25 апреля 2025',
    text: 'Прекрасная студия эпиляции! Очень приветливые сотрудники, обязательно выйдете из этого места с замечательным настроением! Мастер профессионал своего дела, все подробно объяснила и рассказала по поводу процедуры...',
  },
  {
    name: 'Лиза Алексеева',
    rating: 5,
    date: '3 декабря 2024',
    text: 'Добрый день! Хочу поделиться своими приятными впечатлениями о процедуре лазерной эпиляции всего тела, которую проводила замечательный профессионал своего дела — специалист Анастасия. Очень давно хотела сделать эпиляцию, но не решалась...',
  },
  {
    name: 'Виктория Булавская',
    rating: 5,
    date: '22 февраля 2025',
    text: 'Лучшая студия лазерной эпиляции. Мастер Виолетта и мастер Анна шикарные мастера. Результат есть, процедуры проходят в комфортной атмосфере, все очень доброжелательные и приятные.',
  },
  {
    name: 'Людмила Иванова',
    rating: 5,
    date: '8 января 2025',
    text: 'Я уже проходила курсы лазерной эпиляции и сегодня впервые посетила ViART, хочу сказать, что мне очень понравилось! Я рекомендую всем. Во-первых, привлекла акция 30% на первую процедуру, но даже без акций цены демократичные. Во-вторых, там очень приветливые девушки...',
  },
];

/** The four states of an EVERLAS course, one image and one line each. */
const everlasStages = [
  {
    index: '01',
    title: 'Подготовка',
    copy: 'Мастер уточняет противопоказания, осматривает зону и наносит гель.',
    src: '/images/gallery/1.jpg',
    alt: 'Мастер ViART наносит гель перед процедурой лазерной эпиляции',
  },
  {
    index: '02',
    title: 'Настройка',
    copy: 'Параметры аппарата подбираются под зону, тип кожи и волос.',
    src: '/images/gallery/6.jpg',
    alt: 'Аппарат лазерной эпиляции EVERLAS и защитные очки в кабинете ViART',
  },
  {
    index: '03',
    title: 'Процедура',
    copy: 'Работа по разметке; во время процедуры используются защитные очки.',
    src: '/images/equipment/everlas/everlas-procedure-mirrored.png',
    alt: 'Процедура лазерной эпиляции на аппарате EVERLAS',
  },
  {
    index: '04',
    title: 'Курс',
    copy: 'Результат накапливается: интервал между процедурами — 4–6 недель, число зависит от зоны.',
    src: '/images/gallery/8.jpg',
    alt: 'Клиентка ViART у зеркала после процедуры',
  },
];

/** Mosaic rows. A cell without a source still tiles in — the gaps are the grid. */
const mosaicRows: Array<Array<{ src: string; alt: string } | null>> = [
  [
    { src: '/images/gallery/4.jpg', alt: 'Процедура лазерной эпиляции ног в кабинете ViART' },
    null,
    { src: '/images/gallery/5.jpg', alt: 'Сухоцветы и полки с декором в интерьере студии ViART' },
  ],
  [
    { src: '/images/gallery/8.jpg', alt: 'Зона с подсвеченным зеркалом в студии ViART' },
    { src: '/images/gallery/1.jpg', alt: 'Гель и рабочая панель аппарата перед процедурой' },
    null,
    { src: '/images/gallery/7.jpg', alt: 'Манипула аппарата на подготовленной коже руки' },
  ],
];

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderSolid, setIsHeaderSolid] = useState(false);
  const [activePriceTab, setActivePriceTab] = useState(0);
  const [priceGender, setPriceGender] = useState<PriceGender>('women');
  const [reviewIndex, setReviewIndex] = useState(0);
  const [videoState, setVideoState] = useState<VideoState>('poster');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const videoStateRef = useRef<VideoState>('poster');
  const intentionalAudioRef = useRef(false);
  const masterVideoRef = useRef<HTMLVideoElement | null>(null);
  const motionSequenceRef = useRef<HTMLDivElement | null>(null);
  const pageContentRef = useRef<HTMLElement | null>(null);

  // The Animated Beam measures between two nodes inside one container.
  const beamFieldRef = useRef<HTMLDivElement | null>(null);
  const beamSourceRef = useRef<HTMLSpanElement | null>(null);
  const beamTargetRef = useRef<HTMLSpanElement | null>(null);

  const pointerFine = usePointerFine();

  const { scrollTo, setScrollLocked, refresh } = useViartMotion({
    sequence: motionSequenceRef,
    page: pageContentRef,
  });

  useEffect(() => {
    const onScroll = () => setIsHeaderSolid(window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setScrollLocked(isMenuOpen);
    return () => setScrollLocked(false);
  }, [isMenuOpen, setScrollLocked]);

  // The price list is keyed, so a tab or gender swap remounts it at a different
  // height and every scene below `#pricing` is left measured against the page as
  // it used to be. The first pass is skipped: the motion layer runs its own
  // refresh behind `document.fonts.ready`, and racing it re-measures the pins
  // against fonts that have not landed.
  const priceMounted = useRef(false);
  useEffect(() => {
    if (!priceMounted.current) {
      priceMounted.current = true;
      return;
    }
    refresh();
  }, [activePriceTab, priceGender, refresh]);

  const selectGender = (gender: PriceGender) => {
    setPriceGender(gender);
    if (gender === 'men' && activePriceTab === 2) setActivePriceTab(0);
  };

  const openPriceTab = (tab: number) => {
    setActivePriceTab(tab);
    scrollTo('#pricing');
  };

  const changeReview = (direction: number) => {
    setReviewIndex((current) => (current + direction + reviews.length) % reviews.length);
  };

  const playMasterVideo = () => {
    const video = masterVideoRef.current;
    if (!video) return;
    if (videoState === 'error') video.load();
    if (videoState === 'ended' || videoState === 'preview') video.currentTime = 0;
    intentionalAudioRef.current = true;
    setIsAudioEnabled(true);
    video.muted = false;
    videoStateRef.current = 'loading';
    setVideoState('loading');
    video.play()
      .then(() => {
        videoStateRef.current = 'playing';
        setVideoState('playing');
      })
      .catch(() => {
        intentionalAudioRef.current = false;
        setIsAudioEnabled(false);
        videoStateRef.current = 'error';
        setVideoState('error');
      });
  };

  const activeReview = reviews[reviewIndex];

  const mosaicSource = (src: string) => ({ '--mosaic-src': `url('${src}')` }) as CSSProperties;

  return (
    <div className="viart-site">
      <header className={`site-header ${isHeaderSolid || isMenuOpen ? 'is-solid' : ''}`}>
        <div className="site-header__inner">
          <a href="#top" className="site-logo" aria-label="ViART — на главную">ViART</a>
          <nav className="site-nav" aria-label="Основная навигация">
            <a href="#services">Направления</a>
            <a href="#pricing">Услуги и цены</a>
            <a href="#everlas">Оборудование</a>
            <a href="#reviews">Отзывы</a>
            <a href="#contacts">Контакты</a>
          </nav>
          <div className="site-header__actions">
            <a className="header-booking" href={bookingUrl} target="_blank" rel="noopener">Записаться</a>
            <button
              type="button"
              className={`menu-toggle ${isMenuOpen ? 'is-open' : ''}`}
              onClick={() => setIsMenuOpen((value) => !value)}
              aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={isMenuOpen}
            >
              <span /><span />
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu ${isMenuOpen ? 'is-open' : ''}`} aria-hidden={!isMenuOpen}>
        {[
          ['Направления', '#services'],
          ['Услуги и цены', '#pricing'],
          ['Оборудование', '#everlas'],
          ['Отзывы', '#reviews'],
          ['Контакты', '#contacts'],
        ].map(([label, href]) => (
          <a key={href} href={href} onClick={() => setIsMenuOpen(false)}>{label}</a>
        ))}
      </div>

      <main ref={pageContentRef}>
        <div className="viart-motion-sequence" ref={motionSequenceRef}>
          <div className="hb-scene">
            <div className="hb-stage">
              <div className="hb-gallery" aria-hidden="true">
                {[
                  ['/images/gallery/1.jpg', '/images/gallery/5.jpg', '/images/gallery/3.jpg'],
                  ['/images/gallery/4.jpg', '/images/gallery/7.jpg', '/images/gallery/1.jpg'],
                  ['/images/gallery/6.jpg', '/images/gallery/2.jpg', '/images/gallery/8.jpg'],
                  ['/images/gallery/3.jpg', '/images/gallery/7.jpg', '/images/gallery/5.jpg'],
                  ['/images/gallery/6.jpg', '/images/gallery/4.jpg', '/images/gallery/8.jpg'],
                ].map((column, columnIndex) => (
                  <div className={`hb-col ${columnIndex === 2 ? 'hb-col--main' : ''}`} key={`hb-col-${columnIndex}`}>
                    {column.map((src, imageIndex) => {
                      const isFocal = columnIndex === 2 && imageIndex === 1;
                      return (
                        <figure className={`hb-img ${isFocal ? 'hb-img--main' : ''}`} key={`${columnIndex}-${src}`}>
                          <Image
                            src={src}
                            alt=""
                            fill
                            priority={columnIndex < 3}
                            sizes="32vw"
                          />
                        </figure>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="hb-flow">
              <section id="top" className="hb-intro">
                <div className="hb-intro__shade" />
                <div className="hb-intro__copy">
                  <p className="hb-intro__kicker">ViART · Коммунарка</p>
                  <h1>Лазерная эпиляция и аппаратный массаж в Коммунарке</h1>
                  <p className="hb-intro__subtitle">Процедуры на аппаратах EVERLAS и TURBO G8</p>
                  <p className="hb-intro__offer">Скидка 30% на любой комплекс при первом посещении</p>
                  <div className="hb-intro__actions">
                    <InteractiveHoverLink
                      className="viart-cta viart-cta--ivory"
                      href={bookingUrl}
                      target="_blank"
                      rel="noopener"
                    >
                      Выбрать услугу и записаться
                    </InteractiveHoverLink>
                    <a className="text-link" href="#pricing">Услуги и цены <span>↘</span></a>
                  </div>
                </div>
              </section>
              <div className="hb-ws" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* SERVICES — the two directions, as a phased capsule swap.         */}
        {/* Mechanics: motionprompts.dev/component/capsules-animated-columns */}
        {/* ---------------------------------------------------------------- */}
        <section id="services" className="cap-scene">
          <div className="cap-wrapper">
            <div className="cap-col cap-col--1">
              <div className="cap-content">
                <div className="cap-plate cap-plate--text">
                  <div>
                    <p className="tech-label cap-kicker">EVERLAS · направление 01</p>
                    <h2>Лазерная эпиляция</h2>
                  </div>
                  <p className="cap-lead">Курс процедур вместо ежедневной бритвы.</p>
                </div>
              </div>
            </div>

            <div className="cap-col cap-col--2">
              <div className="cap-img cap-img--1">
                <div className="cap-plate">
                  <Image
                    src="/images/gallery/6.jpg"
                    alt="Аппарат для лазерной эпиляции EVERLAS в студии ViART"
                    fill
                    sizes="(max-width: 899px) 50vw, 46vw"
                    className="cover-image"
                  />
                  <p className="tech-label cap-tag">EVERLAS · аппарат</p>
                </div>
              </div>
              <div className="cap-img cap-img--2">
                <div className="cap-plate">
                  <Image
                    src="/images/gallery/7.jpg"
                    alt="Манипула аппарата EVERLAS на подготовленной коже руки"
                    fill
                    sizes="(max-width: 899px) 50vw, 46vw"
                    className="cover-image"
                  />
                  <p className="tech-label cap-tag">Процедура по зоне</p>
                </div>
              </div>
            </div>

            <div className="cap-col cap-col--3">
              <div className="cap-plate cap-plate--text cap-text--a">
                <div>
                  <h3 className="cap-split">Курс, а не разовая процедура</h3>
                </div>
                <div className="cap-points">
                  <p className="cap-split">Процедуры идут с интервалом 4–6 недель — сколько их нужно, зависит от зоны.</p>
                  <p className="cap-split">Отрастающий волос со временем становится тоньше и светлее, а самого волоса — меньше.</p>
                  <p className="cap-split">Параметры мастер подбирает под зону и тип кожи, во время процедуры — защитные очки.</p>
                </div>
              </div>

              {/* Every text node in this column is split, as in the source:
                  an unmasked line here would sit visibly on top of the first
                  block from the very first frame. */}
              <div className="cap-plate--text cap-text--b">
                <div>
                  <p className="tech-label cap-kicker cap-split">TURBO G8 · направление 02</p>
                  <h3 className="cap-split">Аппаратный массаж</h3>
                </div>
                <div className="cap-points">
                  <p className="cap-split">Роликовая манипула прорабатывает выбранные зоны — живот, ягодицы или две зоны на выбор.</p>
                  <p className="cap-split">Интенсивность мастер регулирует по вашим ощущениям прямо во время процедуры.</p>
                  <p className="cap-split">Первое посещение «Коррекции фигуры» — 1500 ₽ вместо 2500 ₽.</p>
                </div>
              </div>
            </div>

            <div className="cap-col cap-col--4">
              <div className="cap-img">
                <div className="cap-plate">
                  <Image
                    src="/images/gallery/2.jpg"
                    alt="Роликовая манипула аппарата TURBO G8 в студии ViART"
                    fill
                    sizes="(max-width: 899px) 50vw, 46vw"
                    className="cover-image"
                  />
                  <p className="tech-label cap-tag">TURBO G8 · манипула</p>
                </div>
              </div>
            </div>
          </div>

          {/* Outside the four columns on purpose: both routes into the price
              list stay visible and keyboard-reachable through every phase. */}
          <div className="cap-actions">
            <InteractiveHoverButton
              type="button"
              className="viart-cta viart-cta--outline"
              onClick={() => openPriceTab(0)}
            >
              Зоны и цены
            </InteractiveHoverButton>
            <InteractiveHoverButton
              type="button"
              className="viart-cta viart-cta--outline"
              onClick={() => openPriceTab(2)}
            >
              Программы и цены
            </InteractiveHoverButton>
          </div>
        </section>

        {/* PRICES — an ordinary interface. Never pinned, never scrubbed. */}
        <section id="pricing" className="chapter pricing-chapter">
          <div className="chapter-heading">
            <div>
              <TextAnimate
                as="h2"
                by="line"
                animation="slideUp"
                once
                duration={0.5}
              >
                {'Открытые цены.\nТочный выбор.'}
              </TextAnimate>
            </div>
            <p data-reveal="">Выберите направление — состав и стоимость всегда остаются перед глазами.</p>
          </div>

          <div className="pricing-layout">
            <aside className="price-controls" aria-label="Фильтры прайс-листа" data-reveal="" data-reveal-delay="0.08">
              <div className="control-group">
                <span className="control-caption">Клиент</span>
                <div className="segmented-control">
                  <button type="button" className={priceGender === 'women' ? 'is-active' : ''} onClick={() => selectGender('women')}>Женщины</button>
                  <button type="button" className={priceGender === 'men' ? 'is-active' : ''} onClick={() => selectGender('men')}>Мужчины</button>
                </div>
              </div>
              <div className="control-group control-group--categories">
                <span className="control-caption">Направление</span>
                {priceTabs.map((tab, index) => (
                  <button
                    type="button"
                    key={tab}
                    className={activePriceTab === index ? 'is-active' : ''}
                    onClick={() => setActivePriceTab(index)}
                    disabled={priceGender === 'men' && index === 2}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <a href={bookingUrl} target="_blank" rel="noopener" className="control-booking">Онлайн-запись <span>↗</span></a>
            </aside>

            <div className="price-content" key={`${priceGender}-${activePriceTab}`}>
              {activePriceTab === 0 && laserPrices[priceGender].map((category) => (
                <section className="service-group" key={category.title}>
                  <div className="service-group__heading">
                    <h3>{category.title}</h3>
                  </div>
                  {category.items.length ? category.items.map((item) => (
                    <div className="service-line" key={item.name}>
                      <span>{item.name}</span>
                      <span className="service-line__rule" aria-hidden="true" />
                      <strong>{item.price}</strong>
                      <a href={bookingUrl} target="_blank" rel="noopener" aria-label={`Записаться на услугу ${item.name}`}>↗</a>
                    </div>
                  )) : <p className="service-empty">Уточните доступность услуги при записи</p>}
                </section>
              ))}

              {activePriceTab === 1 && (
                <section className="complexes-list">
                  <div className="complexes-header"><span>Комплекс</span><span>Состав</span><span>Стоимость</span></div>
                  {epilationComplexes[priceGender].map((item) => (
                    <article className="complex-line" key={item.name}>
                      <div><h3>{item.name}</h3></div>
                      <p>{item.detail}</p>
                      <div className="complex-line__price">
                        <span>{item.price}</span>
                        <strong>{item.firstVisitPrice}</strong>
                        <small>при первом посещении</small>
                      </div>
                      <a href={bookingUrl} target="_blank" rel="noopener" aria-label={`Записаться на комплекс ${item.name}`}>↗</a>
                    </article>
                  ))}
                </section>
              )}

              {activePriceTab === 2 && priceGender === 'women' && (
                <section className="service-group massage-list">
                  <div className="service-group__heading"><h3>Аппаратный массаж</h3><span className="service-note">TURBO G8</span></div>
                  {massagePrices.map((item) => (
                    <div className="service-line" key={item.name}>
                      <span>{item.name}</span>
                      <span className="service-line__rule" aria-hidden="true" />
                      <strong>{item.price}</strong>
                      <a href={bookingUrl} target="_blank" rel="noopener" aria-label={`Записаться на услугу ${item.name}`}>↗</a>
                    </div>
                  ))}
                </section>
              )}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* EVERLAS — four states under a pinned spotlight.                  */}
        {/* Mechanics: motionprompts.dev/component/prototypestudio-scroll-animation */}
        {/* ---------------------------------------------------------------- */}
        <section id="everlas" className="everlas-chapter">
          <div className="spot-intro">
            <div className="spot-intro__copy" data-reveal="">
              <p className="eyebrow">Оборудование</p>
              <h2>Лазерная эпиляция<br />на EVERLAS</h2>
              <p className="spot-intro__lead">
                Процедура помогает сократить рост нежелательных волос и реже пользоваться бритвой.
                Четыре состояния одного курса — от подготовки до интервалов между процедурами.
              </p>
            </div>

            {/* Animated Beam: a light accent between the machine and the zone,
                not a section of its own. */}
            <div className="spot-beam" ref={beamFieldRef} aria-hidden="true">
              <span className="spot-node tech-label" ref={beamSourceRef}>EVERLAS</span>
              <span className="spot-node tech-label" ref={beamTargetRef}>Зона</span>
              <AnimatedBeam
                containerRef={beamFieldRef}
                fromRef={beamSourceRef}
                toRef={beamTargetRef}
                curvature={38}
                pathColor="rgba(201, 168, 76, 0.24)"
                pathWidth={1}
                pathOpacity={1}
                gradientStartColor="#c9a84c"
                gradientStopColor="#d3b561"
                duration={6}
              />
            </div>
          </div>

          <div className="spot-scene">
            <div className="spot-index">
              <span className="spot-counter">01/04</span>
            </div>

            <div className="spot-images">
              {everlasStages.map((stage) => (
                <figure className="spot-img" key={stage.index}>
                  <Image
                    src={stage.src}
                    alt={stage.alt}
                    fill
                    sizes="(max-width: 1000px) 92vw, 35vw"
                    className="cover-image"
                  />
                </figure>
              ))}
            </div>

            <ol className="spot-names">
              {everlasStages.map((stage) => (
                <li className="spot-name" key={stage.index}>
                  <span className="spot-name__index tech-label">{stage.index}</span>
                  <span className="spot-name__title">{stage.title}</span>
                  <span className="spot-name__copy">{stage.copy}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="spot-outro" data-reveal="">
            <p>Число процедур зависит от зоны, кожи и волос — мастер называет ориентир на первой консультации.</p>
            <InteractiveHoverButton
              type="button"
              className="viart-cta viart-cta--outline"
              onClick={() => openPriceTab(0)}
            >
              Выбрать зону или комплекс
            </InteractiveHoverButton>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* GALLERY — every plate tiles in as a 3×3 clip-path mosaic.        */}
        {/* Mechanics: motionprompts.dev/component/mask-reveal               */}
        {/* ---------------------------------------------------------------- */}
        <section id="gallery" className="chapter mosaic-scene">
          <div className="gallery-topline">
            <div>
              <TextAnimate as="h2" by="line" animation="slideUp" once duration={0.5}>
                {'Студия\nв деталях'}
              </TextAnimate>
            </div>
            <p data-reveal="">Реальные кадры пространства, оборудования и процесса.</p>
          </div>

          {mosaicRows.map((row, rowIndex) => (
            <div className="mosaic-row" key={`mosaic-row-${rowIndex}`}>
              {row.map((cell, cellIndex) =>
                cell ? (
                  <div
                    className="mosaic-cell"
                    key={cell.src}
                    style={mosaicSource(cell.src)}
                    role="img"
                    aria-label={cell.alt}
                  />
                ) : (
                  <div
                    className="mosaic-cell mosaic-cell--void"
                    key={`void-${rowIndex}-${cellIndex}`}
                    aria-hidden="true"
                  />
                ),
              )}
            </div>
          ))}

          {/* The lens plate sits outside the rows: it renders its children
              twice, and a mosaic cell must contain exactly nine masks. */}
          <figure className="mosaic-feature" data-reveal="media">
            {pointerFine ? (
              <Lens zoomFactor={1.6} lensSize={210} ariaLabel="Увеличить кадр">
                <Image
                  src="/images/gallery/3.jpg"
                  alt="Гель, деревянные шпатели и защитные очки на столике в кабинете ViART"
                  width={1600}
                  height={1067}
                  sizes="(max-width: 899px) 100vw, 90vw"
                  className="cover-image"
                />
              </Lens>
            ) : (
              <Image
                src="/images/gallery/3.jpg"
                alt="Гель, деревянные шпатели и защитные очки на столике в кабинете ViART"
                width={1600}
                height={1067}
                sizes="(max-width: 899px) 100vw, 90vw"
                className="cover-image"
              />
            )}
            <figcaption className="tech-label">
              Расходные материалы и защитные очки{pointerFine ? ' · наведите, чтобы приблизить' : ''}
            </figcaption>
          </figure>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* VIDEO — the plate grows from a floating thumbnail into the frame. */}
        {/* Mechanics: motionprompts.dev/component/vucko-scroll-animation-javascript */}
        {/* ---------------------------------------------------------------- */}
        <section id="video" className="grow-scene">
          <div className="grow-container">
            {/* Outside the clipped plate on purpose — the glow has to spill. */}
            <Backlight className="grow-backlight" blur={34}>
              <div className="grow-backlight__plate" aria-hidden="true" />
            </Backlight>

            <div className="grow-preview">
              <div className="master-media">
                <video
                  ref={masterVideoRef}
                  src="/videos/viart-procedure-prep.mp4"
                  poster="/images/gallery/1.jpg"
                  playsInline
                  muted={!isAudioEnabled}
                  // The file is ~19MB and its `moov` atom sits at the very end,
                  // so `metadata` costs a fetch of nearly the whole thing before
                  // anything is playable — paid by every visitor, most of whom
                  // never press play, and competing for bandwidth with the
                  // images the scenes are measured against. The poster is what
                  // the section shows until the play button is pressed.
                  preload="none"
                  controls={videoState === 'playing'}
                  onPlay={() => {
                    const nextState = intentionalAudioRef.current ? 'playing' : 'preview';
                    videoStateRef.current = nextState;
                    setVideoState(nextState);
                  }}
                  onPlaying={() => {
                    const nextState = intentionalAudioRef.current ? 'playing' : 'preview';
                    videoStateRef.current = nextState;
                    setVideoState(nextState);
                  }}
                  onWaiting={() => {
                    if (!intentionalAudioRef.current) return;
                    videoStateRef.current = 'loading';
                    setVideoState('loading');
                  }}
                  onPause={(event) => {
                    if (event.currentTarget.ended) return;
                    const nextState = intentionalAudioRef.current || videoStateRef.current === 'playing' || videoStateRef.current === 'paused'
                      ? 'paused'
                      : 'poster';
                    videoStateRef.current = nextState;
                    setVideoState(nextState);
                  }}
                  onEnded={() => {
                    intentionalAudioRef.current = false;
                    setIsAudioEnabled(false);
                    videoStateRef.current = 'ended';
                    setVideoState('ended');
                  }}
                  onError={() => {
                    intentionalAudioRef.current = false;
                    setIsAudioEnabled(false);
                    videoStateRef.current = 'error';
                    setVideoState('error');
                  }}
                />
                {videoState !== 'playing' && videoState !== 'error' && (
                  <button
                    type="button"
                    className="master-play"
                    onClick={playMasterVideo}
                    aria-label={videoState === 'paused' ? 'Продолжить видео' : videoState === 'ended' ? 'Посмотреть видео снова' : 'Воспроизвести видео'}
                    disabled={videoState === 'loading'}
                  >
                    <span>{videoState === 'loading' ? '···' : videoState === 'ended' ? '↻' : '▶'}</span>
                  </button>
                )}
                {videoState === 'error' && (
                  <div className="master-error" role="alert">
                    <p>Видео временно недоступно.</p>
                    <button type="button" className="text-button" onClick={playMasterVideo}>Попробовать снова <span>↻</span></button>
                  </div>
                )}
              </div>
            </div>

            <div className="grow-title">
              <p>Знакомство с ViART</p>
              <p>Коммунарка · Бачуринская 11а к1</p>
            </div>
          </div>

          <div className="grow-context" data-reveal="">
            <p>Посмотрите, как проходит подготовка к процедуре и познакомьтесь с атмосферой студии.</p>
            <a className="text-link" href="#pricing">Услуги и цены <span>↘</span></a>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* COMPLEXES — the first-visit deck, one card per complex.          */}
        {/* Mechanics: motionprompts.dev/component/sticky-cards-ashfall-rebuild-js */}
        {/* ---------------------------------------------------------------- */}
        <section id="promo" className="deck-chapter">
          <div className="deck-intro">
            <div>
              {/* No data-reveal on the wrapper: the heading already has an
                  animation of its own, and stacking a fade on top of it is two
                  systems moving one headline. */}
              <p className="eyebrow" data-reveal="">Первое посещение</p>
              <TextAnimate as="h2" by="line" animation="slideUp" once duration={0.5}>
                {'Комплекс\nсо скидкой 30%'}
              </TextAnimate>
            </div>
            <p data-reveal="" data-reveal-delay="0.08">
              Скидка действует на любой комплекс при первом посещении. Составы и цены — те же, что в прайсе.
            </p>
          </div>

          <div className="deck-scene">
            <div className="deck-container">
              {epilationComplexes.women.map((complex, index) => (
                <article className="deck-card" key={complex.name}>
                  <Image
                    src={everlasStages[index].src}
                    alt=""
                    fill
                    sizes="(max-width: 1000px) 95vw, 50vw"
                    className="cover-image"
                  />
                  <div className="deck-tag"><p className="tech-label">{complex.name}</p></div>
                  <div className="deck-body">
                    <p className="deck-detail">{complex.detail}</p>
                    <p className="deck-price">
                      <span>{complex.price}</span>
                      <strong>{complex.firstVisitPrice}</strong>
                      <small>при первом посещении</small>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="deck-outro" data-reveal="">
            <InteractiveHoverLink
              className="viart-cta viart-cta--ivory"
              href={bookingUrl}
              target="_blank"
              rel="noopener"
            >
              Выбрать комплекс и записаться
            </InteractiveHoverLink>
            <button type="button" className="text-button" onClick={() => openPriceTab(1)}>
              Все комплексы и составы <span>↗</span>
            </button>
          </div>
        </section>

        {/* REVIEWS — the pause after the heavy scenes. No new experience here. */}
        <section id="reviews" className="chapter reviews-chapter">
          <div className="rating-anchor" data-reveal="">
            <strong>5,0</strong>
            <div className="rating-stars" aria-label="Рейтинг 5 из 5">★★★★★</div>
            <p className="rating-counts">
              <NumberTicker value={119} className="rating-counts__value" /> оценок ·{' '}
              <NumberTicker value={98} className="rating-counts__value" /> отзывов
            </p>
            <div className="award-lockup">
              <div className="award-image"><Image src="/images/awards/good-place-2026-source.png" alt="Награда Яндекс Карт Хорошее место 2026" fill sizes="120px" className="contain-image" /></div>
              <span>Хорошее место<br />2026</span>
            </div>
          </div>
          <div className="active-review" key={reviewIndex}>
            <div className="quote-mark">“</div>
            <blockquote>{activeReview.text}</blockquote>
            <footer><strong>{activeReview.name}</strong><span>{activeReview.date}</span></footer>
            <div className="review-controls">
              <button type="button" onClick={() => changeReview(-1)} aria-label="Предыдущий отзыв">←</button>
              <button type="button" onClick={() => changeReview(1)} aria-label="Следующий отзыв">→</button>
            </div>
          </div>
        </section>

        {/* BOOKING — the closing panel: the record, the contacts and the map. */}
        <section id="contacts" className="wipe-booking">
          <div className="wipe-booking__inner">
            <div className="wipe-booking__lead">
              <p className="wipe-eyebrow">Запись в студию</p>
              <h2>Выберите процедуру.<br />Остальное — на нас.</h2>
              <Magnet
                padding={90}
                magnetStrength={7}
                disabled={!pointerFine}
                wrapperClassName="wipe-magnet"
              >
                {/* A div, not a span: the beam renders a div of its own, and
                    a span may only carry phrasing content. */}
                <div className="wipe-cta-frame">
                  <InteractiveHoverLink
                    className="viart-cta viart-cta--dark"
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener"
                  >
                    Записаться в ViART
                  </InteractiveHoverLink>
                  <BorderBeam
                    size={64}
                    duration={9}
                    borderWidth={1}
                    colorFrom="#d3b561"
                    colorTo="#2a1c11"
                  />
                </div>
              </Magnet>
            </div>

            <dl className="wipe-facts">
              <div>
                <dt className="tech-label">Адрес</dt>
                <dd>Москва, Коммунарка,<br />ул. Бачуринская, 11а к1</dd>
              </div>
              <div>
                <dt className="tech-label">Телефон</dt>
                <dd><a href="tel:+79633555888">+7 963 355-58-88</a></dd>
              </div>
              <div>
                <dt className="tech-label">Режим работы</dt>
                <dd>Пн–Вс: 10:00–21:00</dd>
              </div>
              <div>
                <dt className="tech-label">Запись</dt>
                <dd><a href={bookingUrl} target="_blank" rel="noopener">Yclients ↗</a></dd>
              </div>
            </dl>

            <div className="wipe-map">
              <iframe
                src="https://yandex.ru/map-widget/v1/?ll=37.482726%2C55.578294&z=16&pt=37.482726%2C55.578294"
                width="100%"
                height="100%"
                frameBorder="0"
                title="ViART на карте"
                loading="lazy"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-wordmark">ViART</div>
        <div className="footer-meta"><span>© 2026 VIART</span><span>КОММУНАРКА · МОСКВА</span><a href="#top">НАВЕРХ ↑</a></div>
      </footer>
    </div>
  );
}
