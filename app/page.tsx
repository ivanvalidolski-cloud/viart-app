'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useViartMotion } from './lib/motion/useViartMotion';

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

const studioGalleryImages = ['/images/gallery/4.jpg', '/images/gallery/3.jpg', '/images/gallery/5.jpg', '/images/gallery/8.jpg'];
const studioHandoffImage = '/images/gallery/8.jpg';
const VIDEO_SRC = '/videos/viart-procedure-prep.mp4';
const VIDEO_SLOT_COUNT = 3;

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderSolid, setIsHeaderSolid] = useState(false);
  const [activePriceTab, setActivePriceTab] = useState(0);
  const [priceGender, setPriceGender] = useState<PriceGender>('women');
  const [reviewIndex, setReviewIndex] = useState(0);
  const [videoSlotStates, setVideoSlotStates] = useState<VideoState[]>(
    Array.from({ length: VIDEO_SLOT_COUNT }, () => 'poster'),
  );
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const motionSequenceRef = useRef<HTMLDivElement | null>(null);
  const voyeurSceneRef = useRef<HTMLElement | null>(null);
  const pageContentRef = useRef<HTMLElement | null>(null);

  const { scrollTo, setScrollLocked } = useViartMotion({
    sequence: motionSequenceRef,
    voyeur: voyeurSceneRef,
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

  const setVideoSlotState = (index: number, state: VideoState) => {
    setVideoSlotStates((states) => states.map((current, i) => (i === index ? state : current)));
  };

  const playVideoSlot = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;
    // Only one of the three slots plays audio at a time.
    videoRefs.current.forEach((other, otherIndex) => {
      if (other && otherIndex !== index && !other.paused) other.pause();
    });
    if (videoSlotStates[index] === 'error') video.load();
    if (videoSlotStates[index] === 'ended') video.currentTime = 0;
    video.muted = false;
    setVideoSlotState(index, 'loading');
    video.play()
      .then(() => setVideoSlotState(index, 'playing'))
      .catch(() => setVideoSlotState(index, 'error'));
  };

  const activeReview = reviews[reviewIndex];

  return (
    <div className="viart-site">
      <header className={`site-header ${isHeaderSolid || isMenuOpen ? 'is-solid' : ''}`}>
        <div className="site-header__inner">
          <a href="#top" className="site-logo" aria-label="ViART — на главную">ViART</a>
          <nav className="site-nav" aria-label="Основная навигация">
            <a href="#studio">Студия</a>
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
          ['Студия', '#studio'],
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
                    <a className="button button--ivory" href={bookingUrl} target="_blank" rel="noopener">Выбрать услугу и записаться</a>
                    <a className="text-link" href="#pricing">Услуги и цены <span>↘</span></a>
                  </div>
                </div>
              </section>
              <div className="hb-ws" aria-hidden="true" />
            </div>
          </div>

          <section className="vv-hero" ref={voyeurSceneRef}>
            <div className="vv-bg-content">
              <div className="vv-bg-col">
                <div className="vv-bg-copy">
                  <h3>Атмосфера ViART</h3>
                  <p>ViART — студия лазерной эпиляции и аппаратного массажа в Коммунарке.</p>
                </div>
              </div>
              <div className="vv-bg-col">
                <div className="vv-bg-copy">
                  <h3>Спокойное пространство</h3>
                  <p>Здесь легко выбрать отдельную зону, комплекс или программу массажа и заранее посмотреть стоимость.</p>
                </div>
              </div>
            </div>

            <div className="vv-outro-content">
              <figure className="vv-outro-img"><Image src="/images/gallery/4.jpg" alt="Процедура лазерной эпиляции в ViART" fill sizes="50vw" /></figure>
              <figure className="vv-outro-img"><Image src="/images/gallery/8.jpg" alt="Пространство студии ViART" fill sizes="50vw" /></figure>
              <div className="vv-outro-header"><h3>Спокойное пространство для регулярных процедур</h3></div>
            </div>

            <div className="vv-fg-content">
              <figure className="vv-fg-img"><Image src="/images/gallery/2.jpg" alt="Аппаратная процедура в студии ViART" fill priority sizes="100vw" /></figure>
              <div className="vv-fg-header"><h2>Процедуры на аппаратах EVERLAS и TURBO G8</h2></div>
              <div className="vv-fg-overlay-dark" />
              <div className="vv-fg-overlay-accent" />
            </div>
          </section>
        </div>

        <section id="studio" className="chapter studio-chapter">
          <div className="studio-layout">
            <figure className="studio-main-media" data-reveal="media">
              <Image src="/images/gallery/8.jpg" alt="Пространство студии ViART" fill sizes="(max-width: 767px) 100vw, 52vw" className="cover-image" />
            </figure>
            <div className="studio-copy" data-reveal="">
              <p className="eyebrow">Атмосфера ViART</p>
              <h2>Спокойное пространство для регулярных процедур</h2>
              <p>ViART — студия лазерной эпиляции и аппаратного массажа в Коммунарке. Здесь легко выбрать отдельную зону, комплекс или программу массажа и заранее посмотреть стоимость.</p>
              <p>Понятный сценарий записи, спокойная обстановка и реальные материалы студии — без лишней сложности до и во время визита.</p>
            </div>
            <figure className="studio-support-media" data-reveal="media" data-reveal-delay="0.12">
              <Image src="/images/gallery/5.jpg" alt="Детали интерьера студии ViART" fill sizes="(max-width: 767px) 100vw, 40vw" className="cover-image" />
            </figure>
          </div>
        </section>

        <section id="pricing" className="chapter pricing-chapter">
          <div className="chapter-heading" data-reveal="">
            <div>
              <h2>Открытые цены.<br />Точный выбор.</h2>
            </div>
            <p>Выберите направление — состав и стоимость всегда остаются перед глазами.</p>
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

        <section className="chapter procedure-chapter">
          <div className="chapter-heading" data-reveal="">
            <div><h2>Как проходит<br />процедура</h2></div>
            <p>Три момента одного визита — от подготовки до завершения сеанса.</p>
          </div>
          <div className="procedure-scene">
            <div className="procedure-stage">
              <div className="procedure-panel">
                <figure className="procedure-media" aria-hidden="true">
                  <Image src="/images/gallery/2.jpg" alt="" fill sizes="100vw" className="cover-image" />
                </figure>
                <div className="procedure-copy">
                  <span className="tech-label">01 · Контекст</span>
                  <h3>Перед процедурой</h3>
                  <p>Мастер уточняет противопоказания, осматривает выбранную зону и объясняет ход процедуры.</p>
                </div>
              </div>
              <div className="procedure-panel">
                <figure className="procedure-media" aria-hidden="true">
                  <Image src="/images/equipment/everlas/everlas-procedure-mirrored.png" alt="" fill sizes="100vw" className="cover-image" />
                </figure>
                <div className="procedure-copy">
                  <span className="tech-label">02 · Процесс</span>
                  <h3>Во время процедуры</h3>
                  <p>Параметры аппарата подбираются мастером индивидуально; во время работы используются защитные очки.</p>
                </div>
              </div>
              <div className="procedure-panel">
                <figure className="procedure-media" aria-hidden="true">
                  <Image src="/images/gallery/6.jpg" alt="" fill sizes="100vw" className="cover-image" />
                </figure>
                <div className="procedure-copy">
                  <span className="tech-label">03 · Завершение</span>
                  <h3>После процедуры</h3>
                  <p>Мастер даёт рекомендации по уходу и подсказывает, когда планировать следующий визит.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="everlas" className="chapter equipment-chapter">
          <div className="chapter-heading" data-reveal="">
            <div><h2>Оборудование<br />ViART</h2></div>
            <p>Два аппарата сопровождают визит — EVERLAS для лазерной эпиляции и TURBO G8 для аппаратного массажа.</p>
          </div>
          <div className="equipment-scene">
            <div className="equipment-stage">
              <div className="eq-item" data-role="dominant">
                <figure className="eq-figure">
                  <Image src="/images/equipment/everlas/everlas-procedure-mirrored.png" alt="Аппарат EVERLAS во время процедуры лазерной эпиляции" fill sizes="(max-width: 767px) 100vw, 68vw" className="cover-image" />
                </figure>
                <div className="eq-copy">
                  <span className="tech-label">Аппарат 01</span>
                  <h3>EVERLAS</h3>
                  <p className="eq-copy__purpose">Лазерная эпиляция</p>
                  <div className="eq-cta">
                    <p className="eq-copy__note">Процедура помогает сократить рост нежелательных волос и реже пользоваться бритвой.</p>
                    <button type="button" className="button button--outline" onClick={() => openPriceTab(0)}>Выбрать зону или комплекс</button>
                  </div>
                </div>
              </div>
              <div className="eq-item" data-role="secondary-1">
                <figure className="eq-figure">
                  <Image src="/images/equipment/turbo-g8/turbo-g8-procedure.jpg" alt="Аппарат TURBO G8 во время аппаратного массажа" fill sizes="(max-width: 767px) 100vw, 32vw" className="cover-image" />
                </figure>
                <div className="eq-copy">
                  <span className="tech-label">Аппарат 02</span>
                  <h3>TURBO G8</h3>
                  <p className="eq-copy__purpose">Аппаратный массаж</p>
                  <div className="eq-cta">
                    <p className="eq-copy__note">Мастер прорабатывает выбранные зоны роликовой манипулой и регулирует интенсивность по ощущениям клиента.</p>
                    <button type="button" className="text-button" onClick={() => openPriceTab(2)}>Программы и цены <span>↗</span></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="chapter process-chapter">
          <div className="chapter-heading" data-reveal="">
            <div><h2>Что входит<br />в визит</h2></div>
            <p>Четыре шага одного курса — от подготовки зоны до накопленного результата.</p>
          </div>
          <div className="process-scene">
            <div className="process-stage">
              <div className="process-poster">
                <figure className="process-media" aria-hidden="true"><Image src="/images/gallery/1.jpg" alt="" fill sizes="100vw" className="cover-image" /></figure>
                <div className="process-copy">
                  <span className="process-index">01</span>
                  <h3>Подготовка</h3>
                  <p>Перед началом мастер уточняет противопоказания и осматривает выбранную зону.</p>
                </div>
              </div>
              <div className="process-poster">
                <figure className="process-media" aria-hidden="true"><Image src="/images/equipment/everlas/everlas-procedure-mirrored.png" alt="" fill sizes="100vw" className="cover-image" /></figure>
                <div className="process-copy">
                  <span className="process-index">02</span>
                  <h3>Настройка</h3>
                  <p>Параметры аппарата подбираются мастером индивидуально.</p>
                </div>
              </div>
              <div className="process-poster">
                <figure className="process-media" aria-hidden="true"><Image src="/images/equipment/turbo-g8/turbo-g8-procedure.jpg" alt="" fill sizes="100vw" className="cover-image" /></figure>
                <div className="process-copy">
                  <span className="process-index">03</span>
                  <h3>Процедура</h3>
                  <p>Во время процедуры используются защитные очки.</p>
                </div>
              </div>
              <div className="process-poster">
                <figure className="process-media" aria-hidden="true"><Image src="/images/gallery/7.jpg" alt="" fill sizes="100vw" className="cover-image" /></figure>
                <div className="process-copy">
                  <span className="process-index">04</span>
                  <h3>Курс</h3>
                  <p>Результат накапливается постепенно; число процедур зависит от зоны, кожи и волос.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="studio-gallery" className="chapter studio-gallery-chapter">
          <div className="chapter-heading" data-reveal="">
            <div><h2>Студия<br />в деталях</h2></div>
            <p>Реальные кадры пространства и оборудования студии ViART.</p>
          </div>
          <div className="studio-scene" aria-hidden="true">
            <div className="studio-stage">
              {studioGalleryImages.map((src, index) => (
                <figure className="studio-tile" data-role={index === 0 ? 'dominant' : `secondary-${index}`} key={src}>
                  <Image src={src} alt="" fill sizes="(max-width: 899px) 100vw, 64vw" className="cover-image" />
                </figure>
              ))}
            </div>
          </div>

          <div className="studio-video-handoff-scene">
            <div className="studio-video-handoff-stage">
              <div className="studio-handoff-state" data-role="dominant">
                <figure className="studio-handoff-media"><Image src={studioHandoffImage} alt="Пространство студии ViART" fill sizes="(max-width: 767px) 100vw, 50vw" className="cover-image" /></figure>
              </div>
              <div className="studio-handoff-state studio-handoff-state--portrait" data-role="receding">
                <figure className="studio-handoff-media studio-handoff-media--portrait"><Image src={studioHandoffImage} alt="" aria-hidden="true" fill sizes="(max-width: 767px) 90vw, 32vw" className="cover-image" /></figure>
              </div>
            </div>
          </div>
        </section>

        <section id="video" className="chapter video-chapter">
          <div className="video-scene">
            <div className="video-stage">
              {Array.from({ length: VIDEO_SLOT_COUNT }, (_, index) => {
                const state = videoSlotStates[index];
                const playLabel = state === 'paused' ? 'Продолжить видео' : state === 'ended' ? 'Посмотреть видео снова' : 'Воспроизвести видео';
                return (
                  <div className="video-slot" data-role={index === 0 ? 'dominant' : index === 1 ? 'next' : 'hidden'} key={index}>
                    <div className="video-frame">
                      <video
                        ref={(element) => { videoRefs.current[index] = element; }}
                        src={VIDEO_SRC}
                        playsInline
                        muted={state !== 'playing'}
                        preload="metadata"
                        controls={state === 'playing'}
                        onPlaying={() => setVideoSlotState(index, 'playing')}
                        onWaiting={() => setVideoSlotState(index, 'loading')}
                        onPause={(event) => { if (!event.currentTarget.ended) setVideoSlotState(index, 'paused'); }}
                        onEnded={() => setVideoSlotState(index, 'ended')}
                        onError={() => setVideoSlotState(index, 'error')}
                      />
                      {state !== 'playing' && state !== 'error' && (
                        <button
                          type="button"
                          className="master-play"
                          onClick={() => playVideoSlot(index)}
                          aria-label={playLabel}
                          disabled={state === 'loading'}
                        >
                          <span>{state === 'loading' ? '···' : state === 'ended' ? '↻' : '▶'}</span>
                        </button>
                      )}
                      {state === 'error' && (
                        <div className="master-error" role="alert">
                          <p>Видео временно недоступно.</p>
                          <button type="button" className="text-button" onClick={() => playVideoSlot(index)}>Попробовать снова <span>↻</span></button>
                        </div>
                      )}
                    </div>
                    <div className="video-caption">
                      <span className="tech-label">Часть {String(index + 1).padStart(2, '0')} из {VIDEO_SLOT_COUNT}</span>
                      <h3>Знакомство с ViART</h3>
                      <p>Посмотрите, как проходит процедура и познакомьтесь с атмосферой студии.</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="video-complexes-bridge" aria-hidden="true" />
        </section>

        <section id="promo" className="chapter first-visit-chapter">
          <div className="first-visit-heading" data-reveal="">
            <h2>Запишитесь на комплекс со скидкой 30%</h2>
          </div>
          <div className="first-visit-action" data-reveal="" data-reveal-delay="0.12">
            <p>Скидка действует на любой комплекс при первом посещении.</p>
            <a className="button button--ivory" href={bookingUrl} target="_blank" rel="noopener">Выбрать комплекс и записаться</a>
            <a className="text-link" href="#pricing">Вернуться к составам и ценам <span>↑</span></a>
          </div>
        </section>

        <section id="reviews" className="chapter reviews-chapter">
          <div className="rating-anchor" data-reveal="">
            <strong>5,0</strong>
            <div className="rating-stars" aria-label="Рейтинг 5 из 5">★★★★★</div>
            <p>119 оценок · 98 отзывов</p>
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

        <section id="contacts" className="closure-section">
          <div className="closure-message" data-reveal="">
            <h2>Выберите процедуру.<br />Остальное — на нас.</h2>
            <a className="button button--ivory" href={bookingUrl} target="_blank" rel="noopener">Записаться в ViART</a>
          </div>
          <div className="contact-grid" data-reveal="group">
            <div data-reveal-item=""><span className="contact-label">Адрес</span><p>Москва, Коммунарка,<br />ул. Бачуринская, 11а к1</p></div>
            <div data-reveal-item=""><span className="contact-label">Телефон</span><a href="tel:+79633555888">+7 963 355-58-88</a></div>
            <div data-reveal-item=""><span className="contact-label">Режим работы</span><p>Пн–Вс: 10:00–21:00</p></div>
            <div data-reveal-item=""><span className="contact-label">Запись</span><a href={bookingUrl} target="_blank" rel="noopener">Yclients ↗</a></div>
          </div>
          <div className="map-frame" data-reveal="media">
            <iframe
              src="https://yandex.ru/map-widget/v1/?ll=37.482726%2C55.578294&z=16&pt=37.482726%2C55.578294"
              width="100%"
              height="100%"
              frameBorder="0"
              title="ViART на карте"
              loading="lazy"
            />
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
