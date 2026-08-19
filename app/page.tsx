'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useViartMotion } from './lib/motion/useViartMotion';
import { usePointerFine } from './lib/usePointerFine';
import { StudioGallery, type StudioShot } from './components/studio-gallery';
import { VideoWall, type StudioVideo } from './components/video-wall';
import { BorderBeam } from './components/ui/border-beam';
import { InteractiveHoverButton, InteractiveHoverLink } from './components/ui/interactive-hover-button';
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

/**
 * The laser chapter — three states of one direction, held in one sticky
 * viewport. Each carries the направление, the machine, an index, a short
 * heading, two or three lines and the photograph that belongs to them; the
 * scene drives the copy and the picture off one number, so a state is one
 * thing.
 */
const laserStates = [
  {
    index: '01',
    title: 'Курс, а не разовая процедура',
    lines: [
      'Процедуры идут с интервалом 4–6 недель.',
      'Сколько их нужно, зависит от зоны, кожи и волос.',
      'Процедура помогает сократить рост нежелательных волос и реже пользоваться бритвой.',
    ],
    src: '/images/gallery/4.jpg',
    alt: 'Мастер ViART проводит процедуру лазерной эпиляции ног, клиентка в защитных очках',
    focus: '50% 46%',
  },
  {
    index: '02',
    title: 'Параметры под зону',
    lines: [
      'Мастер уточняет противопоказания и осматривает зону.',
      'Параметры аппарата подбираются под зону, тип кожи и волос.',
      'Перед процедурой наносится гель, во время работы используются защитные очки.',
    ],
    src: '/images/gallery/7.jpg',
    alt: 'Манипула аппарата EVERLAS на подготовленной гелем коже руки',
    focus: '50% 42%',
  },
  {
    index: '03',
    title: 'Результат накапливается',
    lines: [
      'Отрастающий волос со временем становится тоньше и светлее, а самого волоса — меньше.',
      'Ориентир по числу процедур мастер называет на первой консультации.',
    ],
    src: '/images/gallery/8.jpg',
    alt: 'Клиентка ViART у подсвеченного зеркала в студии',
    focus: '50% 38%',
  },
];

/**
 * The two machines, one editorial scene each and nothing else on the page that
 * claims to be equipment. Every line here is either the studio's own approved
 * copy or a fact visible in the photograph — no modes, no power figures, no
 * specification that has not been confirmed.
 *
 * The photographs are the machines themselves: `6.jpg` is the laser and its
 * protective glasses, `2.jpg` is the massage unit with the roller manipula in
 * the specialist's hands.
 */
const equipment = [
  {
    name: 'EVERLAS',
    procedure: 'Лазерная эпиляция',
    copy: 'Аппарат, на котором в студии проходит лазерная эпиляция. Работа идёт по разметке зоны, с гелем и защитными очками.',
    master: 'Мастер уточняет противопоказания, осматривает зону и подбирает параметры под тип кожи и волос.',
    src: '/images/gallery/6.jpg',
    alt: 'Аппарат для лазерной эпиляции EVERLAS с защитными очками в кабинете ViART',
    tab: 0,
    cta: 'Зоны и цены',
  },
  {
    name: 'TURBO G8',
    procedure: 'Аппаратный массаж',
    copy: 'Роликовая манипула прорабатывает выбранные зоны — живот, ягодицы или две зоны на выбор.',
    master: 'Интенсивность мастер регулирует по вашим ощущениям прямо во время процедуры.',
    src: '/images/gallery/2.jpg',
    alt: 'Специалист ViART держит роликовую манипулу аппарата аппаратного массажа TURBO G8',
    tab: 2,
    cta: 'Программы и цены',
  },
];

/** The visit itself — one picture and one caption per state. */
const procedureSlides = [
  {
    index: '01',
    title: 'Подготовка',
    copy: 'Мастер уточняет противопоказания, осматривает зону и наносит гель.',
    src: '/images/gallery/1.jpg',
    alt: 'Мастер ViART наносит гель перед процедурой лазерной эпиляции',
    focus: '50% 34%',
  },
  {
    index: '02',
    title: 'Лазерная эпиляция',
    copy: 'Работа по разметке на аппарате EVERLAS; во время процедуры используются защитные очки.',
    src: '/images/equipment/everlas/everlas-procedure-mirrored.png',
    alt: 'Процедура лазерной эпиляции на аппарате EVERLAS: манипула на подготовленной коже руки',
    focus: '50% 52%',
  },
  {
    index: '03',
    title: 'Аппаратный массаж',
    copy: 'Роликовая манипула TURBO G8 проходит выбранную зону — живот, ягодицы или две зоны на выбор.',
    src: '/images/equipment/turbo-g8/turbo-g8-procedure.jpg',
    alt: 'Процедура аппаратного массажа TURBO G8: роликовая манипула на животе',
    focus: '50% 58%',
  },
];

/**
 * «Студия в деталях» — the horizontal gallery.
 *
 * Every frame carries its own index and caption, so nothing here depends on a
 * hover. The protective glasses are one card among the others: they are a
 * detail of the room, not an attraction with a magnifier on it.
 */
const studioShots: StudioShot[] = [
  {
    src: '/images/gallery/3.jpg',
    alt: 'Защитные очки, гель и деревянные шпатели на столике в кабинете ViART',
    caption: 'Защитные очки и расходные материалы на рабочем столике кабинета.',
    focus: '50% 56%',
  },
  {
    src: '/images/gallery/6.jpg',
    alt: 'Аппарат для лазерной эпиляции EVERLAS у подсвеченного зеркала',
    caption: 'Кабинет лазерной эпиляции: аппарат EVERLAS и очки перед процедурой.',
    focus: '50% 40%',
  },
  {
    src: '/images/gallery/1.jpg',
    alt: 'Мастер ViART наносит гель перед процедурой',
    caption: 'Подготовка: гель наносится на зону прямо перед началом работы.',
    focus: '50% 32%',
  },
  {
    src: '/images/gallery/5.jpg',
    alt: 'Сухоцветы и полки с декором в интерьере студии ViART',
    caption: 'Зона ожидания: сухоцветы, полки и тёплый свет.',
    focus: '50% 44%',
  },
  {
    src: '/images/gallery/8.jpg',
    alt: 'Клиентка ViART у подсвеченного зеркала',
    caption: 'Подсвеченное зеркало у выхода из кабинета.',
    focus: '50% 36%',
  },
  {
    src: '/images/gallery/2.jpg',
    alt: 'Роликовая манипула аппарата TURBO G8 в руках специалиста',
    caption: 'Аппаратный массаж: роликовая манипула TURBO G8.',
    focus: '50% 46%',
  },
];

/**
 * The portrait clips.
 *
 * Only the files that actually exist in `public/videos/` are listed. The wall
 * lays out whatever it is given at one size, so adding the remaining clips is
 * adding entries here — no layout change follows.
 */
const studioVideos: StudioVideo[] = [
  {
    src: '/videos/viart-procedure-prep.mp4',
    poster: '/images/gallery/1.jpg',
    title: 'Знакомство с ViART',
    meta: 'Подготовка к процедуре',
    alt: 'Кадр из видео: подготовка к процедуре в студии ViART',
  },
];

/** The first-visit deck's own frames — one per complex, in the deck's order. */
const deckImages = [
  '/images/gallery/4.jpg',
  '/images/gallery/7.jpg',
  '/images/gallery/8.jpg',
  '/images/gallery/6.jpg',
];

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderSolid, setIsHeaderSolid] = useState(false);
  const [activePriceTab, setActivePriceTab] = useState(0);
  const [priceGender, setPriceGender] = useState<PriceGender>('women');
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewDirection, setReviewDirection] = useState(1);
  const motionSequenceRef = useRef<HTMLDivElement | null>(null);
  const pageContentRef = useRef<HTMLElement | null>(null);

  // Where a review swipe started, so a vertical flick is never read as one.
  const reviewTouchRef = useRef<{ x: number; y: number } | null>(null);

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
    setReviewDirection(direction);
    setReviewIndex((current) => (current + direction + reviews.length) % reviews.length);
  };

  const onReviewTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.changedTouches[0];
    reviewTouchRef.current = { x: touch.clientX, y: touch.clientY };
  };

  /**
   * A horizontal flick is the same control as the two arrows. Nothing here
   * calls `preventDefault` — the vertical axis belongs to Lenis, and a gesture
   * that is mostly vertical is a scroll, not a swipe.
   */
  const onReviewTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = reviewTouchRef.current;
    reviewTouchRef.current = null;
    if (!start) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) <= Math.abs(dy)) return;
    changeReview(dx < 0 ? 1 : -1);
  };

  const activeReview = reviews[reviewIndex];

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
        {/* LASER — the direction, as three states of one sticky viewport.    */}
        {/* Desktop: 100svh of stage plus 0.9 of scroll — about 1.9 screens   */}
        {/* for three states, and every screen of it puts something new on    */}
        {/* the page. The copy and the picture of a state are driven off one  */}
        {/* number in `laserStory.ts`, so they arrive and leave together.     */}
        {/* Mobile: the same three states as ordinary stacked blocks.         */}
        {/* ---------------------------------------------------------------- */}
        <section id="services" className="laser-scene">
          <div className="laser-stage">
            {/* One block per state, each holding its own picture and its own
                copy. On a desktop the block is `display: contents` and the two
                children are placed into the stage's two columns — all three
                pictures in one cell, all three copies in the other — so the
                grid does the stacking. On a phone the same block is an ordinary
                media-then-text scene in flow. Either way a state is one node in
                the markup, which is why they cannot be reordered apart. */}
            <div className="laser-inner">
              {laserStates.map((state) => (
                <div className="laser-state" key={state.index}>
                  <figure className="laser-frame">
                    <Image
                      src={state.src}
                      alt={state.alt}
                      fill
                      sizes="(max-width: 899px) 92vw, 56vw"
                      className="cover-image"
                      style={{ objectPosition: state.focus }}
                    />
                  </figure>

                  <div className="laser-copy">
                    <p className="tech-label laser-kicker">
                      <span>Лазерная эпиляция · EVERLAS</span>
                      <span className="laser-index">{state.index}</span>
                    </p>
                    <h2>{state.title}</h2>
                    <div className="laser-lines">
                      {state.lines.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outside the stage on purpose: both routes into the price list
              stay in flow and keyboard-reachable at every scroll position. */}
          <div className="laser-actions">
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
              onClick={() => openPriceTab(1)}
            >
              Комплексы со скидкой 30%
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
        {/* EQUIPMENT — two machines, two procedures, two equal scenes.       */}
        {/* Not a scene in the motion sense: each is an ordinary ~80svh       */}
        {/* editorial block that arrives once, mirrored against the other.    */}
        {/* ---------------------------------------------------------------- */}
        <section id="everlas" className="rig-chapter">
          <div className="rig-intro">
            <div>
              <p className="eyebrow" data-reveal="">Оборудование</p>
              <TextAnimate as="h2" by="line" animation="slideUp" once duration={0.5}>
                {'Два аппарата —\nдве процедуры'}
              </TextAnimate>
            </div>
            <p data-reveal="" data-reveal-delay="0.08">
              На чём работает студия и что мастер делает на каждом из аппаратов.
            </p>
          </div>

          {equipment.map((machine, index) => (
            <article
              className={`rig-scene ${index % 2 === 1 ? 'rig-scene--mirrored' : ''}`}
              key={machine.name}
            >
              <figure className="rig-media" data-reveal="media">
                <Image
                  src={machine.src}
                  alt={machine.alt}
                  fill
                  sizes="(max-width: 899px) 92vw, 46vw"
                  className="cover-image"
                />
              </figure>

              <div className="rig-copy" data-reveal="" data-reveal-delay="0.08">
                <p className="tech-label rig-kicker">
                  {String(index + 1).padStart(2, '0')} · {machine.procedure}
                </p>
                <h3 className="rig-name">{machine.name}</h3>
                <p className="rig-lead">{machine.copy}</p>
                <p className="rig-master">
                  <span className="tech-label">Мастер</span>
                  {machine.master}
                </p>
                <InteractiveHoverButton
                  type="button"
                  className="viart-cta viart-cta--outline"
                  onClick={() => openPriceTab(machine.tab)}
                >
                  {machine.cta}
                </InteractiveHoverButton>
              </div>
            </article>
          ))}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* THE VISIT — three slides, one sticky viewport, ~2.1 screens.      */}
        {/* Picture and caption are one state: both read the same presence,   */}
        {/* so every state is a short joint enter, a long read, a joint exit. */}
        {/* ---------------------------------------------------------------- */}
        <section className="slide-scene">
          <div className="slide-stage">
            {/* Same shape as the laser chapter: one node per state, holding its
                own picture and its own caption. On a desktop the node is
                `display: contents` and the two children are placed into the
                stage's two rows — every frame in the first, every caption in
                the second. Stacked, the node is simply a picture with its
                caption under it. */}
            <div className="slide-inner">
              {procedureSlides.map((slide) => (
                <div className="slide-state" key={slide.index}>
                  <figure className="slide-frame">
                    <Image
                      src={slide.src}
                      alt={slide.alt}
                      fill
                      sizes="(max-width: 899px) 92vw, 64vw"
                      className="cover-image"
                      style={{ objectPosition: slide.focus }}
                    />
                  </figure>

                  <div className="slide-caption">
                    <span className="tech-label slide-index">{slide.index}</span>
                    <span className="slide-title">{slide.title}</span>
                    <span className="slide-copy">{slide.copy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="slide-outro" data-reveal="">
            <p>
              Число процедур зависит от зоны, кожи и волос — мастер называет ориентир на первой
              консультации.
            </p>
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
        {/* STUDIO — a horizontal gallery, not a mosaic. Every frame carries  */}
        {/* its own index and caption, so nothing here needs a hover; the     */}
        {/* protective glasses are one card among the rest.                   */}
        {/* ---------------------------------------------------------------- */}
        <section id="gallery" className="chapter studio-chapter">
          <div className="gallery-topline">
            <div>
              <TextAnimate as="h2" by="line" animation="slideUp" once duration={0.5}>
                {'Студия\nв деталях'}
              </TextAnimate>
            </div>
            <p data-reveal="">
              Реальные кадры пространства, оборудования и процесса — листайте вбок.
            </p>
          </div>

          <StudioGallery shots={studioShots} label="Кадры студии ViART" />
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* VIDEO — portrait clips, one row, all of them equal. Playback is   */}
        {/* pressed, never scrolled into.                                     */}
        {/* ---------------------------------------------------------------- */}
        <section id="video" className="reel-chapter">
          <div className="reel-topline">
            <div>
              <TextAnimate as="h2" by="line" animation="slideUp" once duration={0.5}>
                {'Видео\nиз студии'}
              </TextAnimate>
            </div>
            <p data-reveal="">
              Посмотрите, как проходит подготовка к процедуре и познакомьтесь с атмосферой студии.
            </p>
          </div>

          <div data-reveal="media">
            <VideoWall videos={studioVideos} />
          </div>

          <div className="reel-context" data-reveal="">
            <p>Коммунарка · Бачуринская 11а к1</p>
            <a className="text-link" href="#pricing">Услуги и цены <span>↘</span></a>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* COMPLEXES — the first-visit deck, one card per complex. Nearly    */}
        {/* static by now: the four cards arrive once, as one block.          */}
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
            {/* One reveal on the container, not one per card: the deck is a
                group by this point in the page, not four separate arrivals. */}
            <div className="deck-container" data-reveal="">
              {epilationComplexes.women.map((complex, index) => (
                <article className="deck-card" key={complex.name}>
                  <Image
                    src={deckImages[index % deckImages.length]}
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
          <div
            className="active-review"
            key={reviewIndex}
            data-review-dir={reviewDirection > 0 ? 'next' : 'prev'}
            onTouchStart={onReviewTouchStart}
            onTouchEnd={onReviewTouchEnd}
          >
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
