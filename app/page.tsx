'use client';

import Image from 'next/image';
import { type KeyboardEvent, type TouchEvent, useEffect, useRef, useState } from 'react';
import { Reveal, RevealChild, RevealGroup } from './components/motion';

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
type GalleryRole = 'active' | 'support-one' | 'support-two' | 'support-three' | 'hidden';

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

const galleryImages = Array.from({ length: 8 }, (_, index) => `/images/gallery/${index + 1}.jpg`);
const initialGalleryOrder = [3, 2, 4, 5, 0, 1, 6, 7];

const galleryRoleAt = (position: number): GalleryRole => {
  if (position === 0) return 'active';
  if (position === 1) return 'support-one';
  if (position === 2) return 'support-two';
  if (position === 3) return 'support-three';
  return 'hidden';
};

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderSolid, setIsHeaderSolid] = useState(false);
  const [activePriceTab, setActivePriceTab] = useState(0);
  const [priceGender, setPriceGender] = useState<PriceGender>('women');
  const [galleryOrder, setGalleryOrder] = useState(initialGalleryOrder);
  const [galleryExchangeIndex, setGalleryExchangeIndex] = useState<number | null>(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [videoState, setVideoState] = useState<VideoState>('poster');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEngaged, setIsVideoEngaged] = useState(false);
  const [isFirstVisitEngaged, setIsFirstVisitEngaged] = useState(false);
  const galleryOrderRef = useRef(initialGalleryOrder);
  const galleryIntentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const galleryPrepareTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const galleryExchangeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const galleryHoverLockUntilRef = useRef(0);
  const galleryTouchLockUntilRef = useRef(0);
  const galleryTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const videoStateRef = useRef<VideoState>('poster');
  const intentionalAudioRef = useRef(false);
  const isVideoInViewRef = useRef(false);
  const masterVideoRef = useRef<HTMLVideoElement | null>(null);
  const videoChapterRef = useRef<HTMLElement | null>(null);
  const firstVisitRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onScroll = () => setIsHeaderSolid(window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = isMenuOpen ? 'hidden' : previousOverflow;
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  useEffect(() => () => {
    if (galleryIntentTimerRef.current) clearTimeout(galleryIntentTimerRef.current);
    if (galleryPrepareTimerRef.current) clearTimeout(galleryPrepareTimerRef.current);
    if (galleryExchangeTimerRef.current) clearTimeout(galleryExchangeTimerRef.current);
  }, []);

  useEffect(() => {
    const section = videoChapterRef.current;
    if (!section) return;

    if (!('IntersectionObserver' in window)) {
      isVideoInViewRef.current = true;
      setIsVideoEngaged(true);
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const observer = new IntersectionObserver(([entry]) => {
      const engaged = entry.isIntersecting && entry.intersectionRatio >= 0.08;
      isVideoInViewRef.current = engaged;
      if (engaged) setIsVideoEngaged(true);

      const video = masterVideoRef.current;
      if (!video) return;

      if (engaged && !reducedMotion.matches && videoStateRef.current === 'poster') {
        intentionalAudioRef.current = false;
        setIsAudioEnabled(false);
        video.muted = true;
        video.play().catch(() => {
          videoStateRef.current = 'poster';
          setVideoState('poster');
        });
      } else if (!engaged && !video.paused) {
        const wasIntentional = videoStateRef.current === 'playing' || intentionalAudioRef.current;
        video.pause();
        if (!wasIntentional) video.currentTime = 0;
        video.muted = true;
        intentionalAudioRef.current = false;
        setIsAudioEnabled(false);
        videoStateRef.current = wasIntentional ? 'paused' : 'poster';
        setVideoState(wasIntentional ? 'paused' : 'poster');
      }
    }, { threshold: [0, 0.08, 0.3, 0.6] });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = firstVisitRef.current;
    if (!section) return;

    if (!('IntersectionObserver' in window)) {
      setIsFirstVisitEngaged(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      const engaged = entry.isIntersecting && entry.intersectionRatio >= 0.1;
      if (engaged) setIsFirstVisitEngaged(true);
      if (!engaged) return;

      const video = masterVideoRef.current;
      if (!video || video.paused) return;

      const wasIntentional = videoStateRef.current === 'playing' || intentionalAudioRef.current;
      video.pause();
      if (!wasIntentional) video.currentTime = 0;
      video.muted = true;
      intentionalAudioRef.current = false;
      setIsAudioEnabled(false);
      videoStateRef.current = wasIntentional ? 'paused' : 'poster';
      setVideoState(wasIntentional ? 'paused' : 'poster');
    }, { threshold: [0, 0.1, 0.35] });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const selectGender = (gender: PriceGender) => {
    setPriceGender(gender);
    if (gender === 'men' && activePriceTab === 2) setActivePriceTab(0);
  };

  const openPriceTab = (tab: number) => {
    setActivePriceTab(tab);
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const commitGalleryOrder = (nextOrder: number[]) => {
    galleryOrderRef.current = nextOrder;
    setGalleryOrder(nextOrder);
  };

  const markGalleryExchange = (index: number) => {
    if (galleryExchangeTimerRef.current) clearTimeout(galleryExchangeTimerRef.current);
    setGalleryExchangeIndex(index);
    galleryExchangeTimerRef.current = setTimeout(() => setGalleryExchangeIndex(null), 680);
  };

  const promoteGalleryMedia = (index: number) => {
    if (galleryIntentTimerRef.current) clearTimeout(galleryIntentTimerRef.current);
    if (galleryPrepareTimerRef.current) clearTimeout(galleryPrepareTimerRef.current);

    const currentOrder = galleryOrderRef.current;
    const currentPosition = currentOrder.indexOf(index);
    if (currentPosition <= 0) return;

    const exchange = () => {
      const readyOrder = [...galleryOrderRef.current];
      const readyPosition = readyOrder.indexOf(index);
      if (readyPosition <= 0) return;
      [readyOrder[0], readyOrder[readyPosition]] = [readyOrder[readyPosition], readyOrder[0]];
      commitGalleryOrder(readyOrder);
      if (!isVideoInViewRef.current) setIsVideoEngaged(false);
      galleryHoverLockUntilRef.current = Date.now() + 720;
      markGalleryExchange(index);
    };

    if (currentPosition > 3) {
      const preparedOrder = [...currentOrder];
      [preparedOrder[3], preparedOrder[currentPosition]] = [preparedOrder[currentPosition], preparedOrder[3]];
      commitGalleryOrder(preparedOrder);
      galleryPrepareTimerRef.current = setTimeout(exchange, 170);
      return;
    }

    exchange();
  };

  const queueGalleryMedia = (index: number, respectHoverLock = false) => {
    if (Date.now() < galleryTouchLockUntilRef.current) return;
    if (respectHoverLock && Date.now() < galleryHoverLockUntilRef.current) return;
    if (galleryIntentTimerRef.current) clearTimeout(galleryIntentTimerRef.current);
    galleryIntentTimerRef.current = setTimeout(() => promoteGalleryMedia(index), 140);
  };

  const cancelGalleryIntent = () => {
    if (!galleryIntentTimerRef.current) return;
    clearTimeout(galleryIntentTimerRef.current);
    galleryIntentTimerRef.current = null;
  };

  const stepGallery = (direction: number) => {
    const currentIndex = galleryOrderRef.current[0];
    promoteGalleryMedia((currentIndex + direction + galleryImages.length) % galleryImages.length);
  };

  const handleGalleryTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    galleryTouchStartRef.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  };

  const handleGalleryTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = galleryTouchStartRef.current;
    const touch = event.changedTouches[0];
    galleryTouchStartRef.current = null;
    if (!start || !touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 44 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) return;
    galleryTouchLockUntilRef.current = Date.now() + 420;
    stepGallery(deltaX < 0 ? 1 : -1);
  };

  const handleGalleryKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    stepGallery(event.key === 'ArrowRight' ? 1 : -1);
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
  const galleryIndex = galleryOrder[0];
  const galleryActiveSource = galleryImages[galleryIndex];

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

      <main>
        <section id="top" className="wp-hero">
          <div className="hero-grid">
            <Reveal className="hero-heading" amount={0.1} delay={0.05}>
              <p className="tech-label">VIART / КОММУНАРКА / 01</p>
              <h1>Лазерная эпиляция и аппаратный массаж в Коммунарке</h1>
            </Reveal>

            <Reveal className="hero-media" amount={0.05} distance={0} delay={0.12}>
              <Image
                src="/images/hero-bg.jpg"
                alt="Процедура аппаратного массажа в студии ViART"
                fill
                priority
                sizes="(max-width: 767px) 100vw, 64vw"
                className="hero-media__image"
              />
              <div className="hero-aperture" aria-hidden="true" />
              <div className="hero-trace" aria-hidden="true" />
              <span className="hero-media__meta tech-label">BEAUTY × INSTRUMENT × MATERIAL</span>
            </Reveal>

            <Reveal className="hero-decision" amount={0.1} delay={0.22}>
              <p>Скидка 30% на любой комплекс при первом посещении</p>
              <div className="hero-decision__actions">
                <a className="button button--ivory" href={bookingUrl} target="_blank" rel="noopener">Записаться онлайн</a>
                <a className="text-link" href="#pricing">Посмотреть цены <span>↘</span></a>
              </div>
            </Reveal>
          </div>
          <div className="hero-scroll tech-label">SCROLL TO DISCOVER <span>↓</span></div>
        </section>

        <section id="studio" className="chapter studio-chapter">
          <div className="chapter-index tech-label">02 / STUDIO</div>
          <div className="studio-layout">
            <Reveal as="figure" className="studio-main-media" distance={0} amount={0.15}>
              <Image src="/images/gallery/8.jpg" alt="Пространство студии ViART" fill sizes="(max-width: 767px) 100vw, 52vw" className="cover-image" />
            </Reveal>
            <Reveal className="studio-copy" delay={0.1}>
              <p className="eyebrow">Атмосфера ViART</p>
              <h2>Спокойное пространство для регулярных процедур</h2>
              <p>ViART — студия лазерной эпиляции и аппаратного массажа в Коммунарке. Здесь легко выбрать отдельную зону, комплекс или программу массажа и заранее посмотреть стоимость.</p>
              <p>Понятный сценарий записи, спокойная обстановка и реальные материалы студии — без лишней сложности до и во время визита.</p>
            </Reveal>
            <Reveal as="figure" className="studio-support-media" distance={0} amount={0.15} delay={0.18}>
              <Image src="/images/gallery/5.jpg" alt="Детали интерьера студии ViART" fill sizes="(max-width: 767px) 100vw, 40vw" className="cover-image" />
            </Reveal>
          </div>
        </section>

        <section id="pricing" className="chapter pricing-chapter">
          <Reveal className="chapter-heading" amount={0.3}>
            <div>
              <p className="chapter-index tech-label">03 / SERVICES & PRICES</p>
              <h2>Открытые цены.<br />Точный выбор.</h2>
            </div>
            <p>Выберите направление — состав и стоимость всегда остаются перед глазами.</p>
          </Reveal>

          <div className="pricing-layout">
            <Reveal as="aside" className="price-controls" aria-label="Фильтры прайс-листа" delay={0.08} amount={0.15}>
              <div className="control-group">
                <span className="control-caption tech-label">КЛИЕНТ</span>
                <div className="segmented-control">
                  <button type="button" className={priceGender === 'women' ? 'is-active' : ''} onClick={() => selectGender('women')}>Женщины</button>
                  <button type="button" className={priceGender === 'men' ? 'is-active' : ''} onClick={() => selectGender('men')}>Мужчины</button>
                </div>
              </div>
              <div className="control-group control-group--categories">
                <span className="control-caption tech-label">НАПРАВЛЕНИЕ</span>
                {priceTabs.map((tab, index) => (
                  <button
                    type="button"
                    key={tab}
                    className={activePriceTab === index ? 'is-active' : ''}
                    onClick={() => setActivePriceTab(index)}
                    disabled={priceGender === 'men' && index === 2}
                  >
                    <span>0{index + 1}</span>{tab}
                  </button>
                ))}
              </div>
              <a href={bookingUrl} target="_blank" rel="noopener" className="control-booking">Онлайн-запись <span>↗</span></a>
            </Reveal>

            <div className="price-content" key={`${priceGender}-${activePriceTab}`}>
              {activePriceTab === 0 && laserPrices[priceGender].map((category) => (
                <section className="service-group" key={category.title}>
                  <div className="service-group__heading">
                    <h3>{category.title}</h3>
                    <span className="tech-label">{String(category.items.length).padStart(2, '0')} УСЛУГ</span>
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
                  <div className="complexes-header tech-label"><span>КОМПЛЕКС</span><span>СОСТАВ</span><span>СТОИМОСТЬ</span></div>
                  {epilationComplexes[priceGender].map((item, index) => (
                    <article className="complex-line" key={item.name}>
                      <div><span className="tech-label">0{index + 1}</span><h3>{item.name}</h3></div>
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
                  <div className="service-group__heading"><h3>Аппаратный массаж</h3><span className="tech-label">TURBO G8</span></div>
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

        <section id="everlas" className="chapter everlas-chapter">
          <div className="everlas-stage">
            <Reveal className="everlas-media" distance={0} amount={0.15}>
              <Image src="/images/equipment/everlas/everlas-procedure-mirrored.png" alt="Процедура лазерной эпиляции на EVERLAS" fill sizes="(max-width: 767px) 100vw, 60vw" className="cover-image" />
              <span className="scan-line" aria-hidden="true" />
              <div className="equipment-coordinates tech-label"><span>EVERLAS</span><span>PRECISION MODE</span><span>04 / 10</span></div>
            </Reveal>
            <div className="everlas-copy">
              <Reveal className="technology-heading" amount={0.3}>
                <p className="chapter-index tech-label">04 / PRECISION TECHNOLOGY</p>
                <h2>Лазерная эпиляция на EVERLAS</h2>
                <p>Процедура помогает сократить рост нежелательных волос и реже пользоваться бритвой.</p>
              </Reveal>
              <RevealGroup as="ol" className="fact-stages" step={0.09}>
                <RevealChild as="li"><span className="tech-label">01 / ПОДГОТОВКА</span><p>Перед началом мастер уточняет противопоказания и осматривает выбранную зону.</p></RevealChild>
                <RevealChild as="li"><span className="tech-label">02 / НАСТРОЙКА</span><p>Параметры аппарата подбираются мастером индивидуально.</p></RevealChild>
                <RevealChild as="li"><span className="tech-label">03 / ПРОЦЕДУРА</span><p>Во время процедуры используются защитные очки.</p></RevealChild>
                <RevealChild as="li"><span className="tech-label">04 / КУРС</span><p>Результат накапливается постепенно; число процедур зависит от зоны, кожи и волос.</p></RevealChild>
              </RevealGroup>
              <button type="button" className="button button--outline" onClick={() => openPriceTab(0)}>Выбрать зону или комплекс</button>
            </div>
          </div>
        </section>

        <section className="chapter turbo-chapter">
          <div className="turbo-wave" aria-hidden="true" />
          <Reveal className="turbo-heading" amount={0.3}>
            <p className="chapter-index tech-label">05 / MOVEMENT & SURFACE</p>
            <h2>Аппаратный массаж<br />на TURBO G8</h2>
          </Reveal>
          <Reveal className="turbo-media" distance={0} amount={0.15}>
            <Image src="/images/equipment/turbo-g8/turbo-g8-procedure.jpg" alt="Процедура аппаратного массажа на TURBO G8" fill sizes="(max-width: 767px) 100vw, 70vw" className="cover-image" />
          </Reveal>
          <Reveal className="turbo-copy" delay={0.08} amount={0.25}>
            <p>Мастер прорабатывает выбранные зоны роликовой манипулой и регулирует интенсивность по ощущениям клиента.</p>
            <ul>
              <li>Работа с выбранными зонами</li>
              <li>Регулируемая интенсивность</li>
              <li>Программы для живота, ягодиц и двух зон</li>
            </ul>
            <button type="button" className="text-button" onClick={() => openPriceTab(2)}>Программы и цены <span>↗</span></button>
          </Reveal>
        </section>

        <section id="gallery" className="chapter gallery-chapter">
          <Reveal className="gallery-topline" amount={0.3}>
            <div><p className="chapter-index tech-label">06 / SPACE</p><h2>Студия<br />в деталях</h2></div>
            <p>Реальные кадры пространства, оборудования и процесса.</p>
          </Reveal>
          <div
            className="gallery-stage"
            role="group"
            aria-label="Фотографии пространства студии ViART"
            aria-roledescription="интерактивная галерея"
            tabIndex={0}
            onKeyDown={handleGalleryKeyDown}
            onTouchStart={handleGalleryTouchStart}
            onTouchEnd={handleGalleryTouchEnd}
          >
            {galleryImages.map((src, index) => {
              const position = galleryOrder.indexOf(index);
              const role = galleryRoleAt(position);
              const isActive = role === 'active';

              return (
                <button
                  key={src}
                  type="button"
                  className={`gallery-media gallery-media--${role} ${galleryExchangeIndex === index ? 'is-exchanging' : ''}`}
                  aria-label={isActive ? `Выбран кадр ${index + 1} из ${galleryImages.length}` : `Выбрать кадр ${index + 1} из ${galleryImages.length}`}
                  aria-pressed={isActive}
                  tabIndex={role === 'hidden' ? -1 : 0}
                  onPointerEnter={(event) => {
                    if (!isActive && event.pointerType !== 'touch' && window.matchMedia('(hover: hover) and (pointer: fine)').matches) queueGalleryMedia(index, true);
                  }}
                  onPointerLeave={cancelGalleryIntent}
                  onFocus={() => {
                    if (!isActive) queueGalleryMedia(index);
                  }}
                  onBlur={cancelGalleryIntent}
                  onClick={() => {
                    if (Date.now() >= galleryTouchLockUntilRef.current) promoteGalleryMedia(index);
                  }}
                >
                  <Image
                    src={src}
                    alt={isActive ? `Пространство студии ViART — кадр ${index + 1}` : ''}
                    fill
                    sizes={isActive ? '(max-width: 899px) 100vw, 64vw' : '(max-width: 899px) 33vw, 24vw'}
                    className="cover-image"
                  />
                  <span className="gallery-media__edge" aria-hidden="true" />
                </button>
              );
            })}
            <div className="gallery-status tech-label" aria-live="polite">
              <span>{String(galleryIndex + 1).padStart(2, '0')} / {String(galleryImages.length).padStart(2, '0')}</span>
            </div>
          </div>
        </section>

        <section
          id="video"
          ref={videoChapterRef}
          className={`chapter video-chapter ${isVideoEngaged ? 'is-engaged' : ''}`}
        >
          <div className="media-continuity" aria-hidden="true">
            <Image src={galleryActiveSource} alt="" fill sizes="(max-width: 899px) 100vw, 64vw" className="cover-image" />
            <span className="media-continuity__edge" />
          </div>

          <div className="video-gallery">
            <div className="master-media">
              <video
                ref={masterVideoRef}
                src="/videos/viart-procedure-prep.mp4"
                poster={galleryActiveSource}
                playsInline
                muted={!isAudioEnabled}
                preload="metadata"
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
                  <small className="tech-label">
                    {videoState === 'loading' ? 'LOADING' : videoState === 'paused' ? 'CONTINUE' : videoState === 'ended' ? 'REPLAY' : 'PLAY / FULL VIDEO'}
                  </small>
                </button>
              )}
              {videoState === 'error' && (
                <div className="master-error" role="alert">
                  <span className="tech-label">VIDEO / ERROR</span>
                  <p>Видео временно недоступно.</p>
                  <button type="button" className="text-button" onClick={playMasterVideo}>Попробовать снова <span>↻</span></button>
                </div>
              )}
              <div className="master-rim" aria-hidden="true" />
            </div>

            <Reveal className="video-context" amount={0.25}>
              <p className="chapter-index tech-label">07 / VIDEO GALLERY</p>
              <h2>Знакомство с ViART</h2>
              <p>Посмотрите, как проходит процедура и познакомьтесь с атмосферой студии.</p>
              <div className="video-context__line tech-label"><span>HUMAN MOMENT</span><span>VIART / STUDIO</span></div>
            </Reveal>

          </div>

          <div className="video-resolve" aria-hidden="true"><span /></div>
        </section>

        <section
          id="promo"
          ref={firstVisitRef}
          className={`chapter first-visit-chapter ${isFirstVisitEngaged ? 'is-engaged' : ''}`}
        >
          <div className="first-visit-trace" aria-hidden="true" />
          <Reveal className="first-visit-heading" amount={0.3}>
            <p className="chapter-index tech-label">08 / FIRST VISIT</p>
            <h2>Запишитесь на комплекс со скидкой 30%</h2>
          </Reveal>
          <Reveal className="first-visit-action" amount={0.3} delay={0.12}>
            <p>Скидка действует на любой комплекс при первом посещении.</p>
            <a className="button button--ivory" href={bookingUrl} target="_blank" rel="noopener">Выбрать комплекс и записаться</a>
            <a className="text-link" href="#pricing">Вернуться к составам и ценам <span>↑</span></a>
          </Reveal>
        </section>

        <section id="reviews" className="chapter reviews-chapter">
          <Reveal className="rating-anchor" amount={0.25}>
            <p className="chapter-index tech-label">09 / YANDEX REVIEWS</p>
            <strong>5,0</strong>
            <div className="rating-stars" aria-label="Рейтинг 5 из 5">★★★★★</div>
            <p>119 оценок · 98 отзывов</p>
            <div className="award-lockup">
              <div className="award-image"><Image src="/images/awards/good-place-2026-source.png" alt="Награда Яндекс Карт Хорошее место 2026" fill sizes="120px" className="contain-image" /></div>
              <span>Хорошее место<br />2026</span>
            </div>
          </Reveal>
          <div className="active-review" key={reviewIndex}>
            <div className="quote-mark">“</div>
            <blockquote>{activeReview.text}</blockquote>
            <footer><strong>{activeReview.name}</strong><span>{activeReview.date}</span></footer>
            <div className="review-controls">
              <button type="button" onClick={() => changeReview(-1)} aria-label="Предыдущий отзыв">←</button>
              <span className="tech-label">{String(reviewIndex + 1).padStart(2, '0')} / {String(reviews.length).padStart(2, '0')}</span>
              <button type="button" onClick={() => changeReview(1)} aria-label="Следующий отзыв">→</button>
            </div>
          </div>
        </section>

        <section id="contacts" className="closure-section">
          <div className="closure-trace" aria-hidden="true" />
          <Reveal className="closure-message" amount={0.3}>
            <p className="chapter-index tech-label">10 / BOOKING</p>
            <h2>Выберите процедуру.<br />Остальное — на нас.</h2>
            <a className="button button--ivory" href={bookingUrl} target="_blank" rel="noopener">Записаться в ViART</a>
          </Reveal>
          <RevealGroup className="contact-grid" step={0.07}>
            <RevealChild><span className="tech-label">АДРЕС</span><p>Москва, Коммунарка,<br />ул. Бачуринская, 11а к1</p></RevealChild>
            <RevealChild><span className="tech-label">ТЕЛЕФОН</span><a href="tel:+79633555888">+7 963 355-58-88</a></RevealChild>
            <RevealChild><span className="tech-label">РЕЖИМ РАБОТЫ</span><p>Пн–Вс: 10:00–21:00</p></RevealChild>
            <RevealChild><span className="tech-label">ЗАПИСЬ</span><a href={bookingUrl} target="_blank" rel="noopener">Yclients ↗</a></RevealChild>
          </RevealGroup>
          <Reveal className="map-frame" distance={0} amount={0.1}>
            <iframe
              src="https://yandex.ru/map-widget/v1/?ll=37.482726%2C55.578294&z=16&pt=37.482726%2C55.578294"
              width="100%"
              height="100%"
              frameBorder="0"
              title="ViART на карте"
              loading="lazy"
            />
          </Reveal>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-wordmark">ViART</div>
        <div className="footer-meta tech-label"><span>© 2026 VIART</span><span>КОММУНАРКА · МОСКВА</span><a href="#top">НАВЕРХ ↑</a></div>
      </footer>
    </div>
  );
}
