'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useViartMotion } from './lib/motion/useViartMotion';
import { usePointerFine } from './lib/usePointerFine';
import { BorderBeam } from './components/ui/border-beam';
import { InteractiveHoverButton, InteractiveHoverLink } from './components/ui/interactive-hover-button';
import Magnet from './components/ui/magnet';

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

/** The four states of an EVERLAS course, one image and one line each. Also
 *  Procedure's own card content — reused verbatim, not duplicated data. */
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

/** The studio gallery — context after Procedure: equipment, materials,
 *  space. Not the same photographs Procedure or Directions use. */
const studioGalleryImages = [
  { src: '/images/gallery/2.jpg', alt: 'Роликовая манипула аппарата TURBO G8 в студии ViART' },
  { src: '/images/gallery/3.jpg', alt: 'Гель, деревянные шпатели и защитные очки на столике в кабинете ViART' },
  { src: '/images/gallery/4.jpg', alt: 'Процедура лазерной эпиляции ног в кабинете ViART' },
  { src: '/images/gallery/5.jpg', alt: 'Сухоцветы и полки с декором в интерьере студии ViART' },
  { src: '/images/gallery/7.jpg', alt: 'Манипула аппарата EVERLAS на подготовленной коже руки' },
];

/** EVERLAS → TURBO G8. Every row restates a fact already confirmed
 *  elsewhere on the page — nothing here is an invented spec. Media is an
 *  explicitly-labelled placeholder until the studio supplies production
 *  photography/video. */
const equipmentStages = [
  {
    id: 'everlas',
    kicker: 'EVERLAS · оборудование 01',
    title: 'EVERLAS',
    lead: 'Аппарат для лазерной эпиляции, на котором проходит курс.',
    rows: [
      { label: 'Защита', value: 'Процедура проходит в защитных очках' },
      { label: 'Подготовка', value: 'Параметры подбираются под зону, тип кожи и волос' },
      { label: 'Курс', value: 'Интервал между процедурами — 4–6 недель' },
    ],
    effect: 'Как это проявляется во время процедуры: ощущения мастер регулирует по вашей чувствительности.',
    media: '/images/equipment/everlas/everlas-procedure-mirrored.png',
    alt: 'Процедура на аппарате EVERLAS в студии ViART',
  },
  {
    id: 'turbo',
    kicker: 'TURBO G8 · оборудование 02',
    title: 'TURBO G8',
    lead: 'Аппарат для вибромассажа, на котором проходит «Коррекция фигуры» и комплексы.',
    rows: [
      { label: 'Манипула', value: 'Роликовая манипула прорабатывает выбранные зоны' },
      { label: 'Интенсивность', value: 'Мастер регулирует по вашим ощущениям во время процедуры' },
      { label: 'Первое посещение', value: '1500 ₽ вместо 2500 ₽ на «Коррекцию фигуры»' },
    ],
    effect: 'Как это проявляется во время процедуры: интенсивность настраивается индивидуально.',
    media: '/images/equipment/turbo-g8/turbo-g8-procedure.jpg',
    alt: 'Процедура на аппарате TURBO G8 в студии ViART',
  },
];

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderSolid, setIsHeaderSolid] = useState(false);
  const [activePriceTab, setActivePriceTab] = useState(0);
  const [priceGender, setPriceGender] = useState<PriceGender>('women');
  const [reviewIndex, setReviewIndex] = useState(0);
  const [procedureStep, setProcedureStep] = useState(0);
  // Same default complex First Visit always featured — "Популярный".
  const [complexIndex, setComplexIndex] = useState(2);
  const [videoState, setVideoState] = useState<VideoState>('poster');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const videoStateRef = useRef<VideoState>('poster');
  const intentionalAudioRef = useRef(false);
  const masterVideoRef = useRef<HTMLVideoElement | null>(null);
  const motionSequenceRef = useRef<HTMLDivElement | null>(null);
  const pageContentRef = useRef<HTMLElement | null>(null);

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
  // First Visit's selector always features the women's complexes — the same
  // set already priced on the `#pricing` tab; no gender toggle here, that's
  // its own control elsewhere and out of this scope.
  const firstVisitComplexes = epilationComplexes.women;
  const firstVisitTotal = firstVisitComplexes.length;
  const activeComplex = firstVisitComplexes[complexIndex];

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
          {/* ------------------------------------------------------------ */}
          {/* HERO — one dominant image, the source-object for the         */}
          {/* signature hero → Laser transfer (see `motion/scenes/transfer.ts`). */}
          {/* ------------------------------------------------------------ */}
          <div id="top" className="hero-scene">
            <div className="hero-stage">
              <figure className="hero-media__frame" aria-hidden="true">
                <Image
                  src="/images/equipment/everlas/everlas-procedure-mirrored.png"
                  alt=""
                  fill
                  priority
                  sizes="100vw"
                  className="cover-image"
                />
              </figure>
              <div className="hero-media__shade" aria-hidden="true" />

              <div className="hero-copy">
                <p className="hero-kicker">ViART · Коммунарка</p>
                <h1>Лазерная эпиляция и аппаратный массаж в Коммунарке</h1>
                <p className="hero-offer">Скидка 30% на любой комплекс при первом посещении</p>
                <div className="hero-actions">
                  <InteractiveHoverLink
                    className="viart-cta viart-cta--ivory"
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener"
                  >
                    Выбрать услугу и записаться
                  </InteractiveHoverLink>
                </div>
              </div>
            </div>
            <div className="hero-transfer-spacer" aria-hidden="true" />
          </div>

          {/* ------------------------------------------------------------ */}
          {/* DIRECTIONS — Laser, then Massage. Two fullscreen states,      */}
          {/* stepped one gesture at a time (`motion/scenes/directions.ts`). */}
          {/* Laser's media frame is the transfer's landing target.         */}
          {/* ------------------------------------------------------------ */}
          <section id="services" className="directions-scene">
            <div className="directions-stage">
              <div className="directions-direction directions-direction--laser">
                <figure className="directions-media__frame directions-media__frame--laser">
                  <Image
                    src="/images/equipment/everlas/everlas-procedure-mirrored.png"
                    alt="Процедура лазерной эпиляции на аппарате EVERLAS в студии ViART"
                    fill
                    sizes="(max-width: 899px) 100vw, 58vw"
                    className="cover-image"
                  />
                </figure>
                <div className="directions-panel directions-panel--laser">
                  <p className="tech-label directions-kicker">EVERLAS · направление 01</p>
                  <h2>Лазерная эпиляция</h2>
                  <p className="directions-lead">Курс процедур вместо ежедневной бритвы.</p>
                  <ul className="directions-points">
                    <li>Интервал между процедурами — 4–6 недель, число зависит от зоны.</li>
                    <li>Параметры мастер подбирает под зону и тип кожи, во время процедуры — защитные очки.</li>
                  </ul>
                  <InteractiveHoverButton
                    type="button"
                    className="viart-cta viart-cta--outline"
                    onClick={() => openPriceTab(0)}
                  >
                    Зоны и цены
                  </InteractiveHoverButton>
                </div>
              </div>

              <div className="directions-direction directions-direction--massage">
                <figure className="directions-media__frame directions-media__frame--massage">
                  <Image
                    src="/images/equipment/turbo-g8/turbo-g8-procedure.jpg"
                    alt="Процедура аппаратного массажа на TURBO G8 в студии ViART"
                    fill
                    sizes="(max-width: 899px) 100vw, 58vw"
                    className="cover-image"
                  />
                </figure>
                <div className="directions-panel directions-panel--massage">
                  <p className="tech-label directions-kicker">TURBO G8 · направление 02</p>
                  <h2>Аппаратный массаж</h2>
                  <p className="directions-lead">Роликовая манипула прорабатывает выбранные зоны.</p>
                  <ul className="directions-points">
                    <li>Живот, ягодицы или две зоны на выбор — интенсивность мастер регулирует по ощущениям.</li>
                    <li>Первое посещение «Коррекции фигуры» — 1500 ₽ вместо 2500 ₽.</li>
                  </ul>
                  <InteractiveHoverButton
                    type="button"
                    className="viart-cta viart-cta--outline"
                    onClick={() => openPriceTab(2)}
                  >
                    Программы и цены
                  </InteractiveHoverButton>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* PRICES — an ordinary interface. Never pinned, never scrubbed. */}
        <section id="pricing" className="chapter pricing-chapter">
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
        {/* EQUIPMENT — EVERLAS, then TURBO G8. Two states, stepped           */}
        {/* (`motion/scenes/equipment.ts`). Facts restate what the rest of    */}
        {/* the page already confirms; media is an explicit placeholder.      */}
        {/* ---------------------------------------------------------------- */}
        <section id="everlas" className="equipment-scene">
          <div className="equipment-stage">
            {equipmentStages.map((stage) => (
              <div className={`equipment-layer equipment-layer--${stage.id}`} key={stage.id}>
                <figure className="equipment-media">
                  <Image
                    src={stage.media}
                    alt={stage.alt}
                    fill
                    sizes="(max-width: 899px) 100vw, 56vw"
                    className="cover-image"
                  />
                  <p className="tech-label equipment-media__note">Демонстрационное фото · заменяется</p>
                </figure>
                <div className="equipment-copy">
                  <p className="tech-label equipment-kicker">{stage.kicker}</p>
                  <h2>{stage.title}</h2>
                  <p className="equipment-lead">{stage.lead}</p>
                  <dl className="equipment-rows">
                    {stage.rows.map((row) => (
                      <div className="equipment-row" key={row.label}>
                        <dt>{row.label}</dt>
                        <dd>{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="equipment-effect">{stage.effect}</p>
                </div>
              </div>
            ))}
            <div className="stepper-actions">
              <button type="button" className="text-button" onClick={() => openPriceTab(0)}>Зоны и цены <span>↗</span></button>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* PROCEDURE — 01 → 04, a horizontal process track. Not four fullscreen */}
        {/* card states: one numbered track pans so the active step stays in   */}
        {/* the dominant reading zone while the rest of 01–04 stay visible,     */}
        {/* stepped one gesture per number (`motion/scenes/procedure.ts`).      */}
        {/* Mobile swaps this for a tap-driven step navigator, below — desktop  */}
        {/* pin/gesture-lock is not appropriate to natural touch scroll.        */}
        {/* ---------------------------------------------------------------- */}
        <section id="procedure" className="procedure-scene">
          <div className="procedure-stage">
            <p className="procedure-counter tech-label">01/04</p>

            <div className="procedure-rail">
              <div className="procedure-track">
                <span className="procedure-track__line" aria-hidden="true" />
                <span className="procedure-track__fill" aria-hidden="true" />
                {everlasStages.map((stage) => (
                  <div className="procedure-node" key={stage.index}>
                    <span className="procedure-node__index">{stage.index}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Anchored to the same viewport-relative dominant zone the track's
                active node pans to (`PROCEDURE.dominantZone`), independent of
                the rail's own box — so the title/explanation always read as
                directly under the active number, not wherever the rail happens
                to sit. */}
            <div className="procedure-active">
              {everlasStages.map((stage) => (
                <div className="procedure-active__item" key={stage.index}>
                  <h3>{stage.title}</h3>
                  <p>{stage.copy}</p>
                </div>
              ))}
            </div>

            <div className="procedure-media-rail">
              {everlasStages.map((stage) => (
                <figure className="procedure-media" key={stage.index}>
                  <Image
                    src={stage.src}
                    alt={stage.alt}
                    fill
                    sizes="(max-width: 899px) 100vw, 46vw"
                    className="cover-image"
                  />
                </figure>
              ))}
            </div>

            <div className="stepper-actions">
              <button type="button" className="text-button" onClick={() => openPriceTab(0)}>Выбрать зону или комплекс <span>↗</span></button>
            </div>
          </div>

          {/* Mobile — compact step navigator + one active content panel, per
              §12: 01–04 are explicit tap targets, the active step is unambiguous
              without hover, and number/title/explanation/media stay together. */}
          <div className="procedure-mobile">
            <div className="procedure-mobile__chips" role="tablist" aria-label="Этапы процедуры">
              {everlasStages.map((stage, index) => (
                <button
                  type="button"
                  key={stage.index}
                  role="tab"
                  aria-selected={procedureStep === index}
                  className={`procedure-mobile__chip ${procedureStep === index ? 'is-active' : ''}`}
                  onClick={() => setProcedureStep(index)}
                >
                  {stage.index}
                </button>
              ))}
            </div>

            <div className="procedure-mobile__panel">
              <figure className="procedure-mobile__media">
                <Image
                  src={everlasStages[procedureStep].src}
                  alt={everlasStages[procedureStep].alt}
                  fill
                  sizes="100vw"
                  className="cover-image"
                />
              </figure>
              <p className="tech-label procedure-mobile__index">{everlasStages[procedureStep].index}/04</p>
              <h3>{everlasStages[procedureStep].title}</h3>
              <p>{everlasStages[procedureStep].copy}</p>
              <div className="procedure-mobile__nav">
                <button
                  type="button"
                  onClick={() => setProcedureStep((step) => Math.max(0, step - 1))}
                  disabled={procedureStep === 0}
                  aria-label="Предыдущий этап"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => setProcedureStep((step) => Math.min(everlasStages.length - 1, step + 1))}
                  disabled={procedureStep === everlasStages.length - 1}
                  aria-label="Следующий этап"
                >
                  →
                </button>
              </div>
            </div>

            <div className="stepper-actions">
              <button type="button" className="text-button" onClick={() => openPriceTab(0)}>Выбрать зону или комплекс <span>↗</span></button>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* GALLERY — the studio itself. An ordinary reveal, not a scene:     */}
        {/* the active/first frame is dominant and fully readable, the rest   */}
        {/* give it depth without competing for attention.                   */}
        {/* ---------------------------------------------------------------- */}
        <section id="gallery" className="chapter gallery-scene">
          <div className="gallery-topline" data-reveal="">
            <div>
              <p className="eyebrow">Студия</p>
              <h2>Пространство ViART</h2>
            </div>
            <p>Кабинет, оборудование и материалы, которыми пользуются мастера.</p>
          </div>
          <div className="gallery-grid" data-reveal="group">
            {studioGalleryImages.map((image, index) => (
              <figure
                className={`gallery-frame ${index === 0 ? 'gallery-frame--dominant' : ''}`}
                data-reveal-item=""
                key={image.src}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes={index === 0 ? '(max-width: 899px) 100vw, 42vw' : '(max-width: 899px) 46vw, 22vw'}
                  className="cover-image"
                />
              </figure>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* VIDEOS — three tiles, then Anna + complex. Two states, stepped    */}
        {/* (`motion/scenes/videos.ts`). Only the centre tile is a real,      */}
        {/* interactive video; the other two are explicitly-labelled         */}
        {/* placeholders, never presented as footage that exists yet.        */}
        {/* ---------------------------------------------------------------- */}
        <section id="videos" className="videos-scene">
          <div className="videos-stage">
            <div className="videos-layer videos-layer--trio">
              <figure className="videos-tile videos-tile--placeholder">
                <Image src="/images/gallery/4.jpg" alt="" fill sizes="28vw" className="cover-image" />
                <p className="tech-label videos-tile__note">Видео скоро</p>
              </figure>
              <figure className="videos-tile videos-tile--anna">
                <Image src="/images/gallery/1.jpg" alt="Видео мастера ViART" fill sizes="34vw" className="cover-image" />
                <p className="tech-label videos-tile__note">Видео мастера</p>
              </figure>
              <figure className="videos-tile videos-tile--placeholder">
                <Image src="/images/gallery/7.jpg" alt="" fill sizes="28vw" className="cover-image" />
                <p className="tech-label videos-tile__note">Видео скоро</p>
              </figure>
            </div>

            <div className="videos-layer videos-layer--anna">
              <figure className="videos-plate">
                <video
                  ref={masterVideoRef}
                  className="videos-video"
                  src="/videos/viart-procedure-prep.mp4"
                  poster="/images/gallery/1.jpg"
                  playsInline
                  muted={!isAudioEnabled}
                  // The file is ~19MB and its `moov` atom sits at the very end,
                  // so `metadata` costs a fetch of nearly the whole thing before
                  // anything is playable. The poster is what the section shows
                  // until the play button is pressed.
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
              </figure>

              {/* Desktop — diagonal selector: one central active complex, the
                  other three arrayed along the same diagonal axis, each a
                  plain click/tap target. `slot-N` is the item's position
                  *relative* to whichever is active, recomputed every time
                  `complexIndex` changes — so picking an alternative moves it
                  to slot-0 and redistributes everyone else in one state
                  update, name/composition/price/CTA always in sync. */}
              <div className="complex-selector">
                {firstVisitComplexes.map((item, index) => {
                  const relative = (index - complexIndex + firstVisitTotal) % firstVisitTotal;
                  const isActive = relative === 0;
                  return (
                    <article
                      key={item.name}
                      className={`complex-selector__item slot-${relative} ${isActive ? 'is-active' : ''}`}
                      role={isActive ? undefined : 'button'}
                      tabIndex={isActive ? undefined : 0}
                      onClick={isActive ? undefined : () => setComplexIndex(index)}
                      onKeyDown={isActive ? undefined : (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setComplexIndex(index);
                        }
                      }}
                      aria-label={isActive ? undefined : `Выбрать комплекс ${item.name}`}
                    >
                      {isActive && <p className="tech-label complex-selector__eyebrow">−30% первое посещение</p>}
                      <h3 className="complex-selector__name">{item.name}</h3>
                      {isActive ? (
                        <>
                          <p className="complex-selector__detail">{item.detail}</p>
                          <p className="complex-selector__price">
                            <span>{item.price}</span>
                            <strong>{item.firstVisitPrice}</strong>
                            <small>при первом посещении</small>
                          </p>
                          <div className="complex-selector__actions">
                            <InteractiveHoverLink
                              className="viart-cta viart-cta--ivory"
                              href={bookingUrl}
                              target="_blank"
                              rel="noopener"
                            >
                              Записаться со скидкой
                            </InteractiveHoverLink>
                            <button type="button" className="text-button" onClick={() => openPriceTab(1)}>
                              Все комплексы и составы <span>↗</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <span className="complex-selector__cue">{item.firstVisitPrice}</span>
                      )}
                    </article>
                  );
                })}
              </div>

              {/* Mobile — active complex stays the main information panel;
                  the rest are a compact tap row of names underneath, not the
                  desktop diagonal squeezed into a narrow column (§12). */}
              <div className="complex-selector-mobile">
                <div className="complex-selector-mobile__active">
                  <p className="tech-label">−30% первое посещение</p>
                  <h3>{activeComplex.name}</h3>
                  <p className="complex-selector-mobile__detail">{activeComplex.detail}</p>
                  <p className="complex-selector-mobile__price">
                    <span>{activeComplex.price}</span>
                    <strong>{activeComplex.firstVisitPrice}</strong>
                    <small>при первом посещении</small>
                  </p>
                  <InteractiveHoverLink
                    className="viart-cta viart-cta--ivory"
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener"
                  >
                    Записаться со скидкой
                  </InteractiveHoverLink>
                </div>
                <div className="complex-selector-mobile__chips" role="tablist" aria-label="Комплексы">
                  {firstVisitComplexes.map((item, index) => (
                    <button
                      type="button"
                      key={item.name}
                      role="tab"
                      aria-selected={complexIndex === index}
                      className={`complex-selector-mobile__chip ${complexIndex === index ? 'is-active' : ''}`}
                      onClick={() => setComplexIndex(index)}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
                <button type="button" className="text-button" onClick={() => openPriceTab(1)}>
                  Все комплексы и составы <span>↗</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST — the testimonial is one client's words, an ordinary chapter.
            The award is a separate, sourced fact and lives below as its own
            trust marker between Reviews and the map, not bundled into a
            rating block or shown as a card. */}
        <section id="reviews" className="chapter trust-chapter">
          <div className="trust-testimonial" key={reviewIndex}>
            <p className="tech-label trust-testimonial__eyebrow">Отзывы</p>
            <div className="trust-testimonial__layout">
              <div className="trust-testimonial__quote-block">
                <div className="trust-testimonial__mark" aria-hidden="true">“</div>
                <blockquote className="trust-testimonial__quote">{activeReview.text}</blockquote>
                <footer className="trust-testimonial__footer">
                  <div>
                    <strong>{activeReview.name}</strong>
                    <span>{activeReview.date}</span>
                  </div>
                  <div className="trust-testimonial__controls">
                    <button type="button" onClick={() => changeReview(-1)} aria-label="Предыдущий отзыв">←</button>
                    <button type="button" onClick={() => changeReview(1)} aria-label="Следующий отзыв">→</button>
                  </div>
                </footer>
              </div>
              <figure className="trust-testimonial__media">
                <Image
                  src="/images/gallery/5.jpg"
                  alt="Интерьер студии ViART"
                  fill
                  sizes="(max-width: 900px) 60vw, 26vw"
                  className="cover-image"
                />
              </figure>
            </div>
          </div>
        </section>

        {/* GOOD PLACE — a standalone trust marker between Reviews and the map,
            not a card: a sourced, dated award with one confirmed line of
            explanation. No rating, review count or years-running claim —
            none of that is confirmed evidence for this studio. */}
        <section className="good-place-marker" data-reveal="">
          <div className="good-place-marker__inner">
            <div className="good-place-marker__badge">
              {/* `cover`, not `contain`: the source frame is a wide 1200×630
                  canvas with the badge itself sitting in a narrow vertical
                  band at its centre, surrounded by confetti margin. A
                  portrait box with `cover` crops that margin away instead of
                  rendering the badge small in the middle of empty space. */}
              <Image
                src="/images/awards/good-place-2026-source.png"
                alt="Значок награды Яндекс Карт «Хорошее место — 2026»"
                fill
                sizes="(max-width: 640px) 6.5rem, 8.5rem"
                className="cover-image"
              />
            </div>
            <p className="tech-label good-place-marker__eyebrow">Хорошее место · 2026</p>
            <p className="good-place-marker__copy">
              Награда Яндекс Карт для мест, которые пользователи высоко оценивают, хвалят в отзывах и рекомендуют.
            </p>
            <span className="good-place-marker__cue" aria-hidden="true" />
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
