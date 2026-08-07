'use client';

import { type SyntheticEvent, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

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

const groupLaserItemsByPrice = (items: Array<{ name: string; price: string }>) =>
  items.reduce<Array<{ names: string[]; price: string }>>((groups, item) => {
    const matchingGroup = groups.find((group) => group.price === item.price);

    if (matchingGroup) {
      matchingGroup.names.push(item.name);
    } else {
      groups.push({ names: [item.name], price: item.price });
    }

    return groups;
  }, []);

const formatGroupedServiceNames = (names: string[]) =>
  names
    .map((name, index) => {
      if (name === 'Спина (верх / низ)') return 'спина — верх или низ';
      return index === 0 ? name : `${name.charAt(0).toLocaleLowerCase('ru-RU')}${name.slice(1)}`;
    })
    .join(' · ');

type Review = {
  name: string;
  rating: number;
  text: string;
  date?: string;
};

// Добавляйте сюда только отзывы, предоставленные владельцем ViART.
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
    text: 'Прекрасная студия эпиляции!Очень приветливые сотрудники, обязательно выйдете из этого места с замечательным настроением! Мастер профессионал своего дела, все подробно объяснила и рассказала по поводу процедуры...',
  },
  {
    name: 'Лиза Алексеева',
    rating: 5,
    date: '3 декабря 2024',
    text: 'Добрый День! Хочу поделиться своими приятными впечатлениями о процедуре лазерной эпиляции всего тела ,которую проводила замечательный профессионал своего дела - специалист Анастасия) Очень давно хотела сделать эпиляцию, но не решалась, тк ошибочно думала,...',
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
    text: 'Я уже проходила курсы лазерной эпиляции и сегодня впервые посетила viart, хочу сказать что мне очень понравилось! Я рекомендую всем!) Во первых привлекла акция 30% на первую процедуру, но даже без акций цены демократичные. Во вторых там очень приветливые девушки...',
  },
];
// Вставьте сюда только ссылку, предоставленную владельцем ViART.
const yandexMapsUrl: string | undefined = undefined;
const studioVideos = [
  {
    src: '/videos/viart-procedure-prep.mp4',
  },
  {
    src: '/videos/publicvideosviart-studio-procedure.mp4.mp4',
  },
  {
    src: '/videos/viart-master-work.mp4',
  },
];

const promoCards = [
  {
    title: 'Комплекс «Начальный»',
    price: '2 500 ₽',
    text: 'Тотальное бикини + подмышки. Отличный вариант для первого посещения.',
  },
  {
    title: 'Комплекс «Супер»',
    price: '3 500 ₽',
    text: 'Тотальное бикини + подмышки + голени. Самый популярный выбор клиентов.',
    accent: true,
  },
  {
    title: 'Комплекс «Основной»',
    price: '4 900 ₽',
    text: 'Тотальное бикини + подмышки + ноги полностью + руки до локтя.',
  },
];

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePriceTab, setActivePriceTab] = useState(0);
  const [priceGender, setPriceGender] = useState<PriceGender>('women');
  const [activeVideoSrc, setActiveVideoSrc] = useState<string | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const reviewsViewportRef = useRef<HTMLDivElement | null>(null);
  const reviewsHoverTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const modules = document.querySelectorAll<HTMLElement>('.equipment-module');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      modules.forEach((module) => module.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 });

    modules.forEach((module) => observer.observe(module));
    return () => observer.disconnect();
  }, []);

  const handleVideoPlay = (event: SyntheticEvent<HTMLVideoElement>) => {
    document.querySelectorAll<HTMLVideoElement>('.viart-vertical-video').forEach((video) => {
      if (video !== event.currentTarget) {
        video.pause();
      }
    });
    setActiveVideoSrc(event.currentTarget.getAttribute('src'));
  };

  const handleVideoStop = (event: SyntheticEvent<HTMLVideoElement>) => {
    const videoSrc = event.currentTarget.getAttribute('src');

    if (activeVideoSrc === videoSrc) {
      setActiveVideoSrc(null);
    }
  };

  const playStudioVideo = (index: number) => {
    const video = videoRefs.current[index];

    if (!video) return;

    video.play().catch(() => {
      setActiveVideoSrc(null);
    });
  };

  const showVideoPreview = (event: SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;

    if (video.duration > 0 && video.currentTime === 0) {
      video.currentTime = Math.min(0.1, video.duration / 2);
    }
  };

  const handlePriceGenderChange = (gender: PriceGender) => {
    setPriceGender(gender);

    if (gender === 'men' && activePriceTab === 2) {
      setActivePriceTab(0);
    }
  };

  const openPriceTab = (tabIndex: number) => {
    if (tabIndex === 2 && priceGender === 'men') {
      setPriceGender('women');
    }

    setActivePriceTab(tabIndex);
    requestAnimationFrame(() => {
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const scrollReviews = (direction: -1 | 1) => {
    const viewport = reviewsViewportRef.current;

    if (!viewport) return;

    const firstCard = viewport.querySelector<HTMLElement>('.review-card');
    const track = viewport.querySelector<HTMLElement>('.reviews-track');
    const gap = track ? Number.parseFloat(getComputedStyle(track).gap) || 0 : 0;
    const distance = firstCard ? firstCard.getBoundingClientRect().width + gap : viewport.clientWidth * 0.84;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    viewport.scrollBy({ left: direction * distance, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const startReviewsHoverScroll = () => {
    const viewport = reviewsViewportRef.current;
    if (!viewport || reviewsHoverTimerRef.current !== null) return;

    const advance = () => {
      const isAtEnd = viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 4;

      if (isAtEnd) {
        viewport.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollReviews(1);
      }
    };

    advance();
    reviewsHoverTimerRef.current = setInterval(advance, 1800);
  };

  const stopReviewsHoverScroll = () => {
    if (reviewsHoverTimerRef.current !== null) {
      clearInterval(reviewsHoverTimerRef.current);
      reviewsHoverTimerRef.current = null;
    }
  };

  const toggleReview = (index: number) => {
    setExpandedReviews((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#100905] text-[#f4ecd8] antialiased">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#c9a84c]/15 bg-[#100905]/85 px-5 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between">
          <a href="#" className="font-serif text-2xl font-semibold tracking-wide text-[#e4cc89]">
            ViART
          </a>

          <nav className="hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b8a898] lg:flex">
            <a className="nav-link" href="#about">О студии</a>
            <a className="nav-link" href="#pricing">Цены</a>
            <a className="nav-link" href="#promo">Акции</a>
            <a className="nav-link" href="#contacts">Контакты</a>
            <a className="gold-button px-5 py-2.5" href={bookingUrl} target="_blank" rel="noopener">
              Записаться
            </a>
          </nav>

          <button
            type="button"
            aria-label="Меню"
            onClick={() => setIsMenuOpen((value) => !value)}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
          >
            <span className={`h-0.5 w-6 bg-[#f4ecd8] transition-transform duration-300 ${isMenuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`h-0.5 w-6 bg-[#f4ecd8] transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`h-0.5 w-6 bg-[#f4ecd8] transition-transform duration-300 ${isMenuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </header>

      <div className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-7 bg-[#100905] text-2xl font-light transition-all duration-300 lg:hidden ${isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        {[
          ['О студии', '#about'],
          ['Цены', '#pricing'],
          ['Акции', '#promo'],
          ['Контакты', '#contacts'],
        ].map(([label, href]) => (
          <a key={href} href={href} onClick={() => setIsMenuOpen(false)} className="font-serif text-[#f4ecd8]">
            {label}
          </a>
        ))}
        <a href={bookingUrl} target="_blank" rel="noopener" className="gold-button mt-3 px-7 py-3 text-xs">
          Записаться онлайн
        </a>
      </div>

      <main>
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 pt-24 text-center">
          <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-[#100905]/65" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.18)_0%,rgba(16,9,5,0.18)_38%,#100905_88%)]" />

          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />

          <div className="relative z-10 mx-auto flex max-w-4xl animate-rise flex-col items-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c9a84c]/25 bg-[#c9a84c]/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#e4cc89] md:mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e4cc89] shadow-[0_0_16px_rgba(228,204,137,0.9)]" />
              ViART
            </p>
            <h1 className="font-serif text-[clamp(2.1rem,7vw,4.5rem)] font-light leading-[1.04] tracking-wide text-[#e4cc89] drop-shadow-2xl">
              Лазерная эпиляция и аппаратный массаж в Коммунарке
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-relaxed text-[#f4ecd8] md:mt-6 md:text-base">
              Скидка 30% на любой комплекс при первом посещении
            </p>
            <div className="mt-6 flex w-full max-w-xl flex-col gap-3 sm:mt-8 sm:flex-row">
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener"
                className="gold-button h-16 w-full flex-1 px-8 text-center leading-snug focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f4ecd8] sm:w-auto"
              >
                Выбрать услугу и записаться
              </a>
              <a
                href="#pricing"
                className="glass-button h-16 w-full flex-1 px-8 text-center leading-snug focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f4ecd8] sm:w-auto"
              >
                Услуги и цены
              </a>
            </div>
          </div>
        </section>

        <section id="about" className="section-shell border-t border-[#c9a84c]/10 bg-[#120b07]">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 lg:grid-cols-[1fr_0.8fr] lg:px-10">
            <div className="animate-rise">
              <p className="section-kicker">О студии</p>
              <h2 className="section-title">О студии ViART</h2>
              <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[#b8a898] md:text-base">
                ViART — студия лазерной эпиляции и аппаратного массажа в Коммунарке. Здесь можно выбрать отдельную процедуру или комплекс и записаться онлайн в удобное время.
              </p>

            </div>

            <div className="relative hidden items-center justify-center lg:flex">
              <div className="brand-orbit">
                <span>ViART</span>
              </div>
            </div>
          </div>

        </section>

        <section className="section-shell border-t border-[#c9a84c]/10 bg-[#100905]">
          <div className="mx-auto max-w-7xl px-5 lg:px-10">
            <div className="mb-10 text-center">
              <p className="section-kicker">ViART</p>
              <h2 className="section-title">Атмосфера студии</h2>
            </div>

            <div
              className="studio-video-reel"
              aria-label="Атмосфера студии"
            >
              {studioVideos.map((video, index) => (
                <article key={video.src} className="studio-video-card">
                  <video
                    ref={(element) => {
                      videoRefs.current[index] = element;
                    }}
                    className="viart-vertical-video"
                    src={video.src}
                    muted
                    playsInline
                    preload="auto"
                    onLoadedMetadata={showVideoPreview}
                    onPlay={handleVideoPlay}
                    onPause={handleVideoStop}
                    onEnded={handleVideoStop}
                    onClick={(event) => {
                      if (event.currentTarget.paused) {
                        playStudioVideo(index);
                      } else {
                        event.currentTarget.pause();
                      }
                    }}
                    aria-label="Видео студии ViART"
                  />
                  {activeVideoSrc !== video.src && (
                    <button
                      type="button"
                      className="studio-video-play"
                      onClick={() => playStudioVideo(index)}
                      aria-label="Воспроизвести видео"
                    >
                      <span />
                    </button>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="pricing-section section-shell relative overflow-hidden border-y border-[#c9a84c]/10 bg-[#0d0704]">
          <div className="absolute left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(201,168,76,0.12)_0%,transparent_65%)]" />
          <div className="relative z-10 mx-auto max-w-5xl px-5 lg:px-10">
            <div className="price-gender-switch-wrap">
              <div className={`price-gender-switch ${priceGender === 'men' ? 'is-men' : ''}`} aria-label="Выбор пола для прайса">
                {(['women', 'men'] as const).map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    aria-pressed={priceGender === gender}
                    onClick={() => handlePriceGenderChange(gender)}
                    className={priceGender === gender ? 'is-active' : ''}
                  >
                    {gender === 'women' ? 'Для женщин' : 'Для мужчин'}
                  </button>
                ))}
              </div>
            </div>

            <div
              key={priceGender}
              className={`price-tabs mb-6 ${priceGender === 'women' ? 'price-tabs-three' : 'price-tabs-two'}`}
            >
              {priceTabs.slice(0, priceGender === 'women' ? 3 : 2).map((tab, index) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActivePriceTab(index)}
                  className={`price-tab ${
                    activePriceTab === index
                      ? 'bg-[#c9a84c] text-[#100905] shadow-[0_12px_30px_rgba(201,168,76,0.18)]'
                      : 'text-[#b8a898] hover:bg-white/[0.04] hover:text-[#e4cc89]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activePriceTab === 0 && (
              <div key={`${priceGender}-laser`} className="price-content space-y-5">
                  {laserPrices[priceGender].filter((section) => section.items.length > 0).map((section) => (
                    <section key={section.title}>
                      <h3 className="price-category-title">{section.title}</h3>
                      <div className="price-category-grid">
                        {groupLaserItemsByPrice(section.items).map((group) => (
                          <div key={`${section.title}-${group.price}`} className="price-row price-laser-row">
                            <div className="price-service-list min-w-0 flex-1 font-medium text-[#f4ecd8]">
                              <div className="price-service-name">{formatGroupedServiceNames(group.names)}</div>
                            </div>
                            <div className="price-row-actions">
                              <span className="price-service-value whitespace-nowrap text-sm font-semibold text-[#f4ecd8] sm:text-base">
                                {group.price}
                              </span>
                              <a href={bookingUrl} target="_blank" rel="noopener" className="price-book-button">Записаться</a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
              </div>
            )}

            {activePriceTab === 1 && (
              <div key={`${priceGender}-complexes`} className="price-content">
                <p className="mb-4 text-sm leading-relaxed text-[#b8a898]">
                  Скидка 30% на любой комплекс лазерной эпиляции при первом посещении.
                </p>

                <div key={priceGender} className="space-y-2">
                  {epilationComplexes[priceGender].map((item) => (
                    <div key={item.name} className="price-row price-complex-row">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-[#f4ecd8]">{item.name}</div>
                        <div className="mt-1 text-xs leading-relaxed text-[#9d8f82]">{item.detail}</div>
                      </div>
                      <div className="price-row-actions price-complex-actions">
                        <div className="whitespace-nowrap text-sm font-semibold text-[#f4ecd8] sm:text-base">
                          {item.price} <span className="text-[#9d8f82]">/</span> <span className="text-[#e4cc89]">{item.firstVisitPrice}</span>{' '}
                          <span className="text-[10px] font-normal text-[#9d8f82]">при первом посещении</span>
                        </div>
                        <a href={bookingUrl} target="_blank" rel="noopener" className="price-book-button">Записаться</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {priceGender === 'women' && activePriceTab === 2 && (
              <div className="price-content price-category-grid">
                {massagePrices.map((item) => (
                  <div key={item.name} className={`price-row ${item.name.startsWith('Вибромассаж TURBO G8') ? 'price-massage-featured' : ''}`}>
                    {item.name.startsWith('Вибромассаж TURBO G8') ? (
                      <div className="price-service-copy min-w-0 flex-1">
                        <div className="price-service-name font-medium text-[#f4ecd8]">{item.name}</div>
                        <div className="mt-1 text-xs text-[#9d8f82]">{item.price}</div>
                      </div>
                    ) : (
                      <span className="price-service-name min-w-0 flex-1 font-medium text-[#f4ecd8]">{item.name}</span>
                    )}
                    <div className="price-row-actions">
                      {!item.name.startsWith('Вибромассаж TURBO G8') && (
                        <span className="price-service-value whitespace-nowrap text-sm font-semibold text-[#f4ecd8] sm:text-base">{item.price}</span>
                      )}
                      <a href={bookingUrl} target="_blank" rel="noopener" className="price-book-button">Записаться</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="equipment-section section-shell border-b border-[#c9a84c]/10 bg-[#120b07]">
          <div className="mx-auto max-w-7xl space-y-6 px-5 lg:px-10">
            <article className="equipment-module equipment-module-everlas">
              <div className="equipment-media">
                <Image
                  src="/images/equipment/everlas/everlas-procedure-mirrored.png"
                  alt="Процедура лазерной эпиляции на EVERLAS"
                  className="equipment-image-everlas"
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 78vw, 998px"
                  onError={(event) => {
                    event.currentTarget.hidden = true;
                  }}
                />
              </div>
              <div className="equipment-copy">
                <h2 className="equipment-title equipment-title-everlas">Лазерная эпиляция на EVERLAS</h2>
                <p className="equipment-text">
                  Процедура помогает сократить рост нежелательных волос и реже пользоваться бритвой. Перед началом мастер уточняет противопоказания, осматривает зону и настраивает аппарат.
                </p>
                <ul className="equipment-benefits">
                  <li>Параметры подбирает мастер</li>
                  <li>Перед процедурой уточняются противопоказания</li>
                  <li>Во время процедуры используются защитные очки</li>
                </ul>
                <p className="equipment-note">
                  Результат накапливается постепенно, поэтому требуется курс. Число процедур зависит от зоны, кожи и волос.
                </p>
                <button type="button" className="gold-button equipment-button" onClick={() => openPriceTab(0)}>
                  Выбрать зону или комплекс
                </button>
              </div>
            </article>

            <article className="equipment-module equipment-module-reverse equipment-module-turbo">
              <div className="equipment-media">
                <Image
                  src="/images/equipment/turbo-g8/turbo-g8-procedure.jpg"
                  alt="Процедура аппаратного массажа на TURBO G8"
                  className="equipment-image-turbo"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 78vw, 998px"
                  onError={(event) => {
                    event.currentTarget.hidden = true;
                  }}
                />
              </div>
              <div className="equipment-copy">
                <p className="equipment-kicker">Аппаратный массаж</p>
                <h2 className="equipment-title">Аппаратный массаж на TURBO G8</h2>
                <p className="equipment-text">
                  Мастер прорабатывает выбранные зоны роликовой манипулой и регулирует интенсивность по ощущениям клиента.
                </p>
                <ul className="equipment-benefits">
                  <li>Работа с выбранными зонами</li>
                  <li>Регулируемая интенсивность</li>
                  <li>Программы для живота, ягодиц и двух зон</li>
                </ul>
                <button type="button" className="gold-button equipment-button" onClick={() => openPriceTab(2)}>
                  Посмотреть программы и цены
                </button>
              </div>
            </article>
          </div>
        </section>

        <section className="section-shell bg-[#100905]">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-5 md:grid-cols-4 lg:px-10">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="gallery-tile">
                <img src={`/images/gallery/${index + 1}.jpg`} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
            ))}
          </div>
        </section>

        <section id="promo" className="section-shell bg-[#120b07]">
          <div className="mx-auto max-w-7xl px-5 lg:px-10">
            <div className="mb-12 text-center">
              <p className="section-kicker">Акции</p>
              <h2 className="section-title">
                Комплексы <em className="text-[#e4cc89]">со скидкой</em>
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {promoCards.map((card) => (
                <div key={card.title} className={`promo-card ${card.accent ? 'promo-card-accent' : ''}`}>
                  <h3 className="font-serif text-2xl text-[#f4ecd8]">{card.title}</h3>
                  <div className="mt-5 font-serif text-4xl font-semibold text-[#e4cc89]">{card.price}</div>
                  <p className="mt-4 text-sm leading-relaxed text-[#b8a898]">{card.text}</p>
                  <a href={bookingUrl} target="_blank" rel="noopener" className="gold-button mt-8 inline-flex w-full justify-center px-5 py-3">
                    Записаться
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="trust-section section-shell border-t border-[#c9a84c]/10 bg-[#100905]" aria-labelledby="trust-title">
          <div className="mx-auto max-w-7xl px-5 lg:px-10">
            <div className="trust-plaque">
              <span className="trust-plaque-accent" aria-hidden="true" />
              <div className="trust-header-grid">
                <div className="trust-award-visual" role="img" aria-label="Награда Яндекс Карт «Хорошее место 2026»">
                  <div className="trust-award-pin" aria-hidden="true">
                    <span />
                  </div>
                  <div className="trust-award-name" aria-hidden="true">
                    <span>❧</span>
                    <strong>Хорошее<br />место</strong>
                    <span>❧</span>
                  </div>
                  <span className="trust-award-year" aria-hidden="true">2026</span>
                </div>

                <div className="trust-header-copy trust-description-slot">
                  <h2 id="trust-title" className="trust-title">Хорошее место — 2026</h2>
                  <p>Награда Яндекс Карт для мест, которые пользователи высоко оценивают, хвалят в отзывах и рекомендуют.</p>
                </div>

                <div className="trust-award-panel">
                  <div className="trust-rating-summary" aria-label="Рейтинг 5 из 5">
                    <strong>5,0</strong>
                    <span aria-hidden="true">★★★★★</span>
                  </div>
                  <p className="trust-counts">119 оценок · 98 отзывов</p>
                  {yandexMapsUrl && (
                    <a href={yandexMapsUrl} target="_blank" rel="noopener noreferrer" className="trust-map-link">
                      Все отзывы в Яндекс Картах
                    </a>
                  )}
                </div>
              </div>

            {reviews.length > 0 && (
              <div className="reviews-block">
                <div className="reviews-toolbar">
                  <div className="reviews-controls" aria-label="Перелистывание отзывов">
                    <button type="button" onClick={() => scrollReviews(-1)} aria-label="Предыдущие отзывы">←</button>
                    <button type="button" onClick={() => scrollReviews(1)} aria-label="Следующие отзывы">→</button>
                  </div>
                </div>
                <div
                  ref={reviewsViewportRef}
                  className="reviews-viewport"
                  onMouseEnter={startReviewsHoverScroll}
                  onMouseLeave={stopReviewsHoverScroll}
                >
                  <div className="reviews-track">
                    {reviews.map((review, index) => {
                      const isExpanded = expandedReviews.has(index);
                      const isLong = review.text.length > 220;

                      return (
                      <article key={`${review.name}-${index}`} className="review-card">
                        <div className="review-card-top">
                          <strong>{review.name}</strong>
                          {review.date && <time>{review.date}</time>}
                        </div>
                        <div className="review-stars" aria-label={`Оценка ${review.rating} из 5`}>
                          {Array.from({ length: 5 }).map((_, star) => (
                            <span key={star} className={star < review.rating ? 'is-filled' : ''}>★</span>
                          ))}
                        </div>
                        <p className={isExpanded ? 'is-expanded' : ''}>{review.text}</p>
                        <div className="review-card-footer">
                          {isLong ? (
                            <button type="button" onClick={() => toggleReview(index)} aria-expanded={isExpanded}>
                              {isExpanded ? 'Свернуть' : 'Читать полностью'}
                            </button>
                          ) : <span />}
                          <span>Яндекс Карты</span>
                        </div>
                      </article>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </section>

        <section id="contacts" className="section-shell border-t border-[#c9a84c]/10 bg-[#100905]">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 lg:grid-cols-2 lg:px-10">
            <div className="flex flex-col justify-center">
              <p className="section-kicker">Контакты</p>
              <h2 className="font-serif text-5xl font-light text-[#e4cc89]">ViART</h2>
              <div className="mt-8 space-y-4 text-sm text-[#b8a898]">
                <p>Адрес: <span className="text-[#f4ecd8]">Москва, Коммунарка, ул. Бачуринская, 11а к1</span></p>
                <p>Телефон: <a href="tel:+79633555888" className="text-[#e4cc89] hover:underline">+7 963 355-58-88</a></p>
                <p>Время работы: <span className="text-[#f4ecd8]">Пн–Вс: 10:00–21:00</span></p>
              </div>
            </div>
            <div className="h-72 overflow-hidden rounded-2xl border border-[#c9a84c]/20 bg-neutral-950 shadow-2xl shadow-black/30 lg:h-96">
              <iframe
                src="https://yandex.ru/map-widget/v1/?ll=37.482726%2C55.578294&z=16&pt=37.482726%2C55.578294"
                width="100%"
                height="100%"
                frameBorder="0"
                className="block grayscale-[15%]"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#c9a84c]/15 bg-[#0d0704] px-5 py-8 text-center text-xs text-[#7a6e62]">
        © 2026 ViART · Москва
      </footer>
    </div>
  );
}
