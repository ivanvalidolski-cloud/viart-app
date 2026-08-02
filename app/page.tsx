'use client';

import { useState } from 'react';

const bookingUrl = 'https://n1177049.yclients.com';

const priceCategories = [
  {
    tab: 'Лазерная эпиляция',
    items: [
      { name: 'Верхняя губа', detail: '~10 мин', price: '800 ₽', promo: '400 ₽' },
      { name: 'Подбородок', detail: '~10 мин', price: '900 ₽', promo: '450 ₽' },
      { name: 'Подмышки', detail: '~15 мин', price: '1 500 ₽', promo: '750 ₽', popular: true },
      { name: 'Бикини классическое', detail: '~20 мин', price: '2 200 ₽', promo: '1 100 ₽', popular: true },
      { name: 'Глубокое бикини', detail: '~30 мин', price: '3 500 ₽', promo: '1 750 ₽', popular: true },
      { name: 'Голени', detail: '~30 мин', price: '3 000 ₽', promo: '1 500 ₽' },
      { name: 'Бёдра', detail: '~35 мин', price: '3 500 ₽', promo: '1 750 ₽' },
      { name: 'Руки полностью', detail: '~35 мин', price: '3 800 ₽', promo: '1 900 ₽' },
      { name: 'Спина', detail: '~40 мин', price: '4 500 ₽' },
      { name: 'Ноги полностью', detail: '~60 мин', price: '6 000 ₽' },
      { name: 'Тело полностью', detail: '~2 часа', price: '12 000 ₽' },
    ],
  },
  {
    tab: 'Массаж',
    items: [
      { name: 'Лимфодренажный', detail: '60 мин · разгон лимфы, снятие отёков', price: '3 500 ₽', promo: '1 750 ₽', popular: true },
      { name: 'Антистресс', detail: '60 мин · глубокое расслабление', price: '3 200 ₽', promo: '1 600 ₽', popular: true },
      { name: 'Скульптурирующий', detail: '90 мин · коррекция контура тела', price: '4 800 ₽', promo: '2 400 ₽' },
      { name: 'Расслабляющий', detail: '60 мин · снятие мышечных зажимов', price: '2 900 ₽', promo: '1 450 ₽' },
      { name: 'Массаж лица', detail: '45 мин · лифтинг + лимфодренаж', price: '2 500 ₽', promo: '1 250 ₽' },
      { name: 'Спина и шея', detail: '45 мин · точечная проработка зажимов', price: '2 800 ₽' },
    ],
  },
  {
    tab: 'Премиум комплексы',
    items: [
      { name: '«Шелковое тело»', detail: 'Эпиляция подмышек + бикини + лимфодренаж 60 мин', price: '7 200 ₽', promo: '5 500 ₽', popular: true },
      { name: '«Полное преображение»', detail: 'Эпиляция тела полностью + антистресс 90 мин', price: '17 200 ₽', promo: '14 500 ₽' },
      { name: '«Лёгкость лета»', detail: 'Эпиляция ног + скульптурирующий массаж бёдер', price: '9 300 ₽', promo: '7 500 ₽', popular: true },
      { name: '«Лицо и тело»', detail: 'Эпиляция верхней губы + подбородка + массаж лица', price: '4 200 ₽', promo: '3 200 ₽' },
    ],
  },
];

const stats = [
  { value: '5+', label: 'лет работы' },
  { value: '3 000+', label: 'клиентов' },
  { value: '98%', label: 'рекомендуют' },
  { value: '30+', label: 'зон' },
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
            <div className="mt-6 flex w-full max-w-xl flex-col gap-3 sm:mt-8 sm:flex-row sm:items-start">
              <div className="flex flex-1 flex-col items-center gap-2">
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener"
                  className="gold-button w-full px-8 py-4 text-center leading-snug focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f4ecd8]"
                >
                  Выбрать услугу и записаться
                </a>
              </div>
              <a
                href="#pricing"
                className="glass-button w-full flex-1 px-8 py-4 text-center leading-snug focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f4ecd8] sm:w-auto"
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
              <h2 className="section-title">
                Красота через <em className="text-[#e4cc89]">технологии</em>
              </h2>
              <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[#b8a898] md:text-base">
                Используем сертифицированный немецкий диодный лазер. Он точно работает с фолликулом и не перегревает кожу, а мощность настраивается под ваш тип кожи и цвет волос.
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#b8a898] md:text-base">
                Одноразовые расходники, защитные очки, тщательная стерилизация аппарата перед каждой процедурой. Результат заметен уже после первого визита.
              </p>

              <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="stat-card">
                    <div className="font-serif text-3xl text-[#e4cc89]">{stat.value}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-widest text-[#b8a898]">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden items-center justify-center lg:flex">
              <div className="brand-orbit">
                <span>ViART</span>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-14 max-w-7xl px-5 lg:px-10">
            <div className="award-card">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fc3f1d] text-xl text-white shadow-lg shadow-[#fc3f1d]/20">
                ★
              </div>
              <div>
                <h3 className="font-serif text-xl text-[#f4ecd8]">«Хорошее место» от Яндекса</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#b8a898]">
                  Знак качества, который Яндекс выдаёт бизнесам с высоким рейтингом. Это честная оценка нашей работы: клиенты отмечают качество услуг, чистоту и профессионализм мастеров.
                </p>
              </div>
            </div>
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

        <section id="pricing" className="section-shell relative overflow-hidden border-y border-[#c9a84c]/10 bg-[#0d0704]">
          <div className="absolute left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(201,168,76,0.12)_0%,transparent_65%)]" />
          <div className="relative z-10 mx-auto max-w-5xl px-5 lg:px-10">
            <div className="mb-12 text-center">
              <p className="section-kicker">Прайс-лист</p>
              <h2 className="section-title">Прозрачные цены</h2>
              <p className="mt-4 text-sm text-[#b8a898]">
                * Специальная сниженная стоимость по акции применима для первого ознакомительного сеанса
              </p>
            </div>

            <div className="mb-9 grid gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-1.5 sm:grid-cols-3">
              {priceCategories.map((category, index) => (
                <button
                  key={category.tab}
                  type="button"
                  onClick={() => setActivePriceTab(index)}
                  className={`rounded-xl px-3 py-3 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
                    activePriceTab === index
                      ? 'bg-[#c9a84c] text-[#100905] shadow-[0_12px_30px_rgba(201,168,76,0.18)]'
                      : 'text-[#b8a898] hover:bg-white/[0.04] hover:text-[#e4cc89]'
                  }`}
                >
                  {category.tab}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {priceCategories[activePriceTab].items.map((item) => (
                <div key={item.name} className={`price-row ${item.popular ? 'price-row-popular' : ''}`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-[#f4ecd8]">{item.name}</span>
                      {item.popular && <span className="hit-badge">Хит продаж</span>}
                    </div>
                    <div className="mt-1 text-xs text-[#7a6e62]">{item.detail}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                    {item.promo && <span className="hidden text-xs font-medium text-[#7a6e62] line-through sm:block">{item.price}</span>}
                    <span className={`whitespace-nowrap text-sm font-semibold sm:text-base ${item.promo ? 'text-[#e4cc89]' : 'text-[#f4ecd8]'}`}>
                      {item.promo ?? item.price}
                    </span>
                    <a href={bookingUrl} target="_blank" rel="noopener" className="hidden rounded-sm border border-[#c9a84c]/30 px-4 py-1.5 text-[10px] uppercase tracking-wider text-[#c9a84c] transition-all hover:border-[#c9a84c] hover:bg-[#c9a84c]/10 sm:inline-flex">
                      Записаться
                    </a>
                  </div>
                </div>
              ))}
            </div>
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
