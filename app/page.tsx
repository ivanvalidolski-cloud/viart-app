'use client';

import { useState } from 'react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePriceTab, setActivePriceTab] = useState(0);

  const priceCategories = [
    {
      tab: "Лазерная эпиляция",
      items: [
        { name: "Верхняя губа", detail: "~10 мин", price: "800 ₽", promo: "400 ₽" },
        { name: "Подбородок", detail: "~10 мин", price: "900 ₽", promo: "450 ₽" },
        { name: "Подмышки", detail: "~15 мин", price: "1 500 ₽", promo: "750 ₽", popular: true },
        { name: "Бикини классическое", detail: "~20 мин", price: "2 200 ₽", promo: "1 100 ₽", popular: true },
        { name: "Глубокое бикини", detail: "~30 мин", price: "3 500 ₽", promo: "1 750 ₽", popular: true },
        { name: "Голени", detail: "~30 мин", price: "3 000 ₽", promo: "1 500 ₽" },
        { name: "Бёдра", detail: "~35 мин", price: "3 500 ₽", promo: "1 750 ₽" },
        { name: "Руки полностью", detail: "~35 мин", price: "3 800 ₽", promo: "1 900 ₽" },
        { name: "Спина", detail: "~40 мин", price: "4 500 ₽" },
        { name: "Ноги полностью", detail: "~60 мин", price: "6 000 ₽" },
        { name: "Тело полностью", detail: "~2 часа", price: "12 000 ₽" },
      ],
    },
    {
      tab: "Массаж",
      items: [
        { name: "Лимфодренажный", detail: "60 мин · разгон лимфы, снятие отёков", price: "3 500 ₽", promo: "1 750 ₽", popular: true },
        { name: "Антистресс", detail: "60 мин · глубокое расслабление", price: "3 200 ₽", promo: "1 600 ₽", popular: true },
        { name: "Скульптурирующий", detail: "90 мин · коррекция контура тела", price: "4 800 ₽", promo: "2 400 ₽" },
        { name: "Расслабляющий", detail: "60 мин · снятие мышечных зажимов", price: "2 900 ₽", promo: "1 450 ₽" },
        { name: "Массаж лица", detail: "45 мин · лифтинг + лимфодренаж", price: "2 500 ₽", promo: "1 250 ₽" },
        { name: "Спина и шея", detail: "45 мин · точечная проработка зажимов", price: "2 800 ₽" },
      ],
    },
    {
      tab: "Премиум комплексы",
      items: [
        { name: "«Шелковое тело»", detail: "Эпиляция подмышек + бикини + лимфодренаж 60 мин", price: "7 200 ₽", promo: "5 500 ₽", popular: true },
        { name: "«Полное преображение»", detail: "Эпиляция тела полностью + антистресс 90 мин", price: "17 200 ₽", promo: "14 500 ₽" },
        { name: "«Лёгкость лета»", detail: "Эпиляция ног + скульптурирующий массаж бёдер", price: "9 300 ₽", promo: "7 500 ₽", popular: true },
        { name: "«Лицо и тело»", detail: "Эпиляция верхней губы + подбородка + массаж лица", price: "4 200 ₽", promo: "3 200 ₽" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#1a120b] text-[#f0e6d0] antialiased">
      
      {/* ШАПКА */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a120b]/95 backdrop-blur-md border-b border-[#c9a84c]/10 py-4 px-6 transition-all">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 text-2xl font-bold tracking-wider text-[#e4cc89] font-serif">
            ViART
          </a>
          
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#about" className="text-xs uppercase tracking-widest text-[#b8a898] hover:text-[#c9a84c] transition-colors">О студии</a>
            <a href="#pricing" className="text-xs uppercase tracking-widest text-[#b8a898] hover:text-[#c9a84c] transition-colors">Цены</a>
            <a href="#promo" className="text-xs uppercase tracking-widest text-[#b8a898] hover:text-[#c9a84c] transition-colors">Акции</a>
            <a href="#reviews" className="text-xs uppercase tracking-widest text-[#b8a898] hover:text-[#c9a84c] transition-colors">Отзывы</a>
            <a href="https://n1177049.yclients.com" target="_blank" rel="noopener" className="border border-[#c9a84c] text-[#c9a84c] px-5 py-2 rounded text-xs uppercase tracking-wider hover:bg-[#c9a84c] hover:text-[#1a120b] transition-all">
              Записаться
            </a>
          </nav>
          
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden flex flex-col gap-1.5 p-2 z-50">
            <span className={`w-6 h-0.5 bg-[#f0e6d0] transition-transform duration-300 ${isMenuOpen ? 'translate-y-2 rotate-45' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-[#f0e6d0] transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-[#f0e6d0] transition-transform duration-300 ${isMenuOpen ? '-translate-y-2 -rotate-45' : ''}`}></span>
          </button>
        </div>
      </header>

      {/* МОБИЛЬНОЕ МЕНЮ */}
      <div className={`fixed inset-0 bg-[#1a120b] z-40 flex flex-col items-center justify-center gap-6 transition-all duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <a href="#about" onClick={() => setIsMenuOpen(false)} className="text-2xl font-serif">О студии</a>
        <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-2xl font-serif">Цены</a>
        <a href="#promo" onClick={() => setIsMenuOpen(false)} className="text-2xl font-serif">Акции</a>
        <a href="#reviews" onClick={() => setIsMenuOpen(false)} className="text-2xl font-serif">Отзывы</a>
        <a href="https://n1177049.yclients.com" target="_blank" className="text-[#c9a84c] text-xl font-serif mt-4">Записаться онлайн</a>
      </div>

      {/* КОНТЕНТ */}
      <main className="pt-24 px-6 max-w-[1200px] mx-auto">
        
        {/* ПЕРВЫЙ ЭКРАН */}
        <section className="relative min-h-[75vh] flex items-center justify-center text-center py-12 -mx-6 px-6 overflow-hidden bg-[url('/images/hero-bg.jpg')] bg-cover bg-center">
          <div className="absolute inset-0 bg-[#1a120b]/70"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a120b]/60 via-transparent to-[#1a120b]"></div>
          <div className="relative z-10 flex flex-col items-center max-w-3xl">
            <h1 className="font-serif text-6xl md:text-8xl tracking-wide text-[#e4cc89] mb-2 drop-shadow-xl">ViART</h1>
            <p className="text-[#c9a84c] uppercase tracking-[6px] text-xs md:text-sm mb-8 font-light">студия лазерной эпиляции</p>
            <p className="text-sm md:text-lg text-[#b8a898] max-w-xl mb-10 leading-relaxed">
              Студия лазерной эпиляции и массажа. Сертифицированный немецкий диодный лазер. Скидка 30% на первое посещение.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
              <a href="https://n1177049.yclients.com" target="_blank" className="bg-[#c9a84c] text-[#1a120b] py-4 px-8 rounded font-semibold text-xs uppercase tracking-wider hover:bg-[#e4cc89] active:scale-95 transition-all">
                Записаться онлайн
              </a>
              <a href="#pricing" className="border border-[#c9a84c]/40 py-4 px-8 rounded font-semibold text-xs uppercase tracking-wider hover:border-[#c9a84c] active:scale-95 transition-all">
                Услуги и цены
              </a>
            </div>
          </div>
        </section>

        {/* О СТУДИИ */}
        <section id="about" className="py-16 border-t border-[#c9a84c]/10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h2 className="font-serif text-4xl md:text-5xl mb-6 font-light text-[#f0e6d0]">Красота через <em className="italic text-[#e4cc89]">технологии</em></h2>
              <p className="text-[#b8a898] mb-4 text-sm md:text-base leading-relaxed">Используем сертифицированный немецкий диодный лазер — он точно бьёт в фолликул, не повреждая кожу. Настраиваем мощность под ваш тип кожи и цвет волос.</p>
              <p className="text-[#b8a898] mb-8 text-sm md:text-base leading-relaxed">Одноразовые расходники, защитные очки, тщательная стерилизация аппарата перед каждой процедурой. Результат заметен уже после первого визита.</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { n: "5+", l: "лет работы" },
                  { n: "3 000+", l: "клиентов" },
                  { n: "98%", l: "рекомендуют" },
                  { n: "30+", l: "зон" }
                ].map((st, i) => (
                  <div key={i} className="p-4 border border-[#c9a84c]/20 rounded-lg bg-[#2a1f14] text-center">
                    <div className="font-serif text-2xl font-semibold text-[#e4cc89] mb-1">{st.n}</div>
                    <div className="text-[9px] text-[#b8a898] uppercase tracking-wider whitespace-nowrap">{st.l}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="hidden lg:flex justify-center">
              <div className="text-6xl font-serif tracking-widest text-[#e4cc89] select-none p-16 border border-[#c9a84c]/40 rounded-full drop-shadow-xl">
                ViART
              </div>
            </div>
          </div>

          {/* ЯНДЕКС НАГРАДА */}
          <div className="bg-[#221810] border border-[#c9a84c]/20 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 mt-16 shadow-md text-left">
            <div className="w-12 h-12 rounded-full bg-[#fc3f1d] flex items-center justify-center text-white text-xl shrink-0 shadow-lg shadow-[#fc3f1d]/20">
              ★
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#f0e6d0] mb-1 font-medium">«Хорошее место» от Яндекса</h3>
              <p className="text-[#b8a898] text-xs md:text-sm leading-relaxed">Знак качества, который Яндекс выдает бизнесам с самым высоким рейтингом. Это честная оценка нашей работы: сотни реальных клиентов подтверждают качество услуг, идеальную чистоту и профессионализм мастеров.</p>
            </div>
          </div>
        </section>

        {/* ГАЛЕРЕЯ */}
        <section id="gallery" className="pt-8 pb-16 border-t border-[#c9a84c]/10 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className="aspect-square w-full rounded-lg border border-[#c9a84c]/20 bg-[#221810] flex items-center justify-center overflow-hidden hover:border-[#c9a84c]/60 transition-colors cursor-pointer">
                <img src={`/images/gallery/${idx + 1}.jpg`} alt="" className="w-full h-full object-cover" onError={(e) => {e.currentTarget.className = 'hidden'}} />
              </div>
            ))}
          </div>
        </section>

        {/* ПРАЙС */}
        <section id="pricing" className="relative py-24 border-t border-b border-[#c9a84c]/10 overflow-hidden">
          <div className="absolute top-0 left-1/2 h-[360px] w-[800px] -translate-x-1/2 pointer-events-none bg-[radial-gradient(ellipse,rgba(201,168,76,0.08)_0%,transparent_65%)]"></div>
          <div className="relative z-10 max-w-5xl mx-auto">
            <div className="mb-12 text-center">
              <p className="text-[11px] uppercase tracking-[0.25em] mb-4 text-[#c9a84c]">Прайс-лист</p>
              <h2 className="font-serif text-4xl md:text-6xl font-light text-[#f0e6d0]">Прозрачные цены</h2>
              <p className="mt-3 text-sm text-[#b8a898]">* Специальная сниженная стоимость по акции применима для первого ознакомительного сеанса</p>
            </div>

            <div className="rounded-xl p-1.5 flex flex-col sm:flex-row gap-1 mb-9 bg-white/[0.02] border border-white/[0.05]">
              {priceCategories.map((category, idx) => (
                <button
                  key={category.tab}
                  onClick={() => setActivePriceTab(idx)}
                  className={`flex-1 py-3 px-3 text-[11px] font-semibold uppercase tracking-wider rounded-lg transition-all duration-300 ${
                    activePriceTab === idx ? 'bg-[#c9a84c] text-[#1a120b]' : 'text-[#b8a898] hover:text-[#e4cc89]'
                  }`}
                >
                  {category.tab}
                </button>
              ))}
            </div>

            <div className="space-y-2.5">
              {priceCategories[activePriceTab].items.map((item) => (
                <div
                  key={item.name}
                  className={`rounded-xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4 bg-[#221810] border transition-all duration-300 ${
                    item.popular ? 'border-[#c9a84c]/30 shadow-[0_0_20px_rgba(201,168,76,0.05)]' : 'border-transparent'
                  }`}
                >
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="text-sm font-medium text-[#f0e6d0]">{item.name}</span>
                      {item.popular && (
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-sm bg-[#c9a84c] text-[#1a120b]">
                          Хит продаж
                        </span>
                      )}
                    </div>
                    <div className="text-xs mt-1 text-[#7a6e62]">{item.detail}</div>
                  </div>

                  <div className="flex items-center justify-end gap-3 sm:gap-4 shrink-0">
                    {item.promo && <span className="text-xs line-through hidden sm:block font-medium text-[#7a6e62]">{item.price}</span>}
                    <span className={`text-sm sm:text-base font-semibold whitespace-nowrap ${item.promo ? 'text-[#e4cc89]' : 'text-[#f0e6d0]'}`}>
                      {item.promo ?? item.price}
                    </span>
                    <a href="https://n1177049.yclients.com" target="_blank" rel="noopener" className="hidden sm:inline-flex px-4 py-1.5 text-[10px] uppercase tracking-wider rounded-sm border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c]/10 hover:border-[#c9a84c] transition-all">
                      Записаться
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* АКЦИИ */}
        <section id="promo" className="py-16 border-t border-[#c9a84c]/10">
          <h2 className="font-serif text-4xl text-center mb-12 font-light">Комплексы <em className="italic text-[#e4cc89]">со скидкой</em></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 border border-[#c9a84c]/20 rounded-xl overflow-hidden bg-[#221810]">
            
            <div className="p-6 border-b md:border-b-0 md:border-r border-[#c9a84c]/10 flex flex-col justify-between text-left">
              <div>
                <h3 className="font-serif text-xl text-[#f0e6d0] mb-4">Комплекс «Начальный»</h3>
                <div className="text-[#e4cc89] text-3xl font-bold font-serif mb-4">2 500 ₽</div>
                <p className="text-xs text-[#b8a898] leading-relaxed mb-6">Тотальное бикини + подмышки. Отличный вариант для первого посещения.</p>
              </div>
              <a href="https://n1177049.yclients.com" target="_blank" className="bg-[#c9a84c] text-[#1a120b] block text-center py-3 rounded text-xs font-semibold uppercase tracking-wider hover:bg-[#e4cc89]">Записаться</a>
            </div>

            <div className="p-6 border-b md:border-b-0 md:border-r border-[#c9a84c]/10 flex flex-col justify-between text-left bg-[#2a1f14]">
              <div>
                <h3 className="font-serif text-xl text-[#f0e6d0] mb-4">Комплекс «Супер»</h3>
                <div className="text-[#e4cc89] text-3xl font-bold font-serif mb-4">3 500 ₽</div>
                <p className="text-xs text-[#b8a898] leading-relaxed mb-6">Тотальное бикини + подмышки + голени. Самый популярный выбор клиентов.</p>
              </div>
              <a href="https://n1177049.yclients.com" target="_blank" className="bg-[#c9a84c] text-[#1a120b] block text-center py-3 rounded text-xs font-semibold uppercase tracking-wider hover:bg-[#e4cc89]">Записаться</a>
            </div>

            <div className="p-6 flex flex-col justify-between text-left">
              <div>
                <h3 className="font-serif text-xl text-[#f0e6d0] mb-4">Комплекс «Основной»</h3>
                <div className="text-[#e4cc89] text-3xl font-bold font-serif mb-4">4 900 ₽</div>
                <p className="text-xs text-[#b8a898] leading-relaxed mb-6">Тотальное бикини + подмышки + ноги полностью + руки до локтя.</p>
              </div>
              <a href="https://n1177049.yclients.com" target="_blank" className="bg-[#c9a84c] text-[#1a120b] block text-center py-3 rounded text-xs font-semibold uppercase tracking-wider hover:bg-[#e4cc89]">Записаться</a>
            </div>

          </div>
        </section>

        {/* КОНТАКТЫ */}
        <section id="contacts" className="py-16 border-t border-[#c9a84c]/10 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="flex flex-col justify-center gap-6">
              <h2 className="font-serif text-4xl text-[#f0e6d0] font-light">ViART</h2>
              <div className="text-sm text-[#b8a898] space-y-3">
                <p>📍 Адрес: <span className="text-[#f0e6d0]">Москва, Коммунарка, ул. Бачуринская, 11а к1</span></p>
                <p>📞 Телефон: <a href="tel:+79633555888" className="text-[#c9a84c] font-semibold hover:underline">+7 963 355-58-88</a></p>
                <p>⏰ Время работы: <span className="text-[#f0e6d0]">Пн–Вс: 10:00–21:00</span></p>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-[#c9a84c]/20 h-64 bg-neutral-950">
              <iframe src="https://yandex.ru/map-widget/v1/?ll=37.482726%2C55.578294&z=16&pt=37.482726%2C55.578294" width="100%" height="100%" frameBorder="0" className="block filter grayscale-[20%]"></iframe>
            </div>
          </div>
        </section>

      </main>

      {/* ПОДВАЛ */}
      <footer className="bg-[#221810] border-t border-[#c9a84c]/20 py-8 text-center text-xs text-[#7a6e62]">
        <p>© 2026 ViART · Москва</p>
      </footer>

    </div>
  );
}
