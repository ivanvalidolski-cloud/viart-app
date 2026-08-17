---
name: performance-seo
description: Performance and local-SEO rules for the ViART site — image and font budgets, the cost of GSAP/Lenis, deferring the map and video, Core Web Vitals, metadata and LocalBusiness structured data. Use when asked about speed, Lighthouse, bundle size, images, fonts, search visibility or metadata.
---

# ViART performance & local SEO

A studio site is found on a phone, over mobile data, from a local search. Two things
decide whether it converts: how fast the first screen paints, and whether Yandex and
Google understand that this is a real business in Kommunarka with an address, hours
and a rating.

## Budgets

| Thing | Rule |
|---|---|
| Webfonts | 3 families max, all via `next/font`, all with the `cyrillic` subset. Never a bare system stack for display text. |
| Above-the-fold images | Only genuinely visible art gets `priority`. Everything else lazy-loads. |
| Every `next/image` | Explicit `sizes`. A missing `sizes` on a `fill` image ships the largest candidate to a phone. |
| Animation JS | GSAP + ScrollTrigger + SplitText + Lenis is the whole animation budget. Adding a second library is not a trade-off, it is a regression. |
| Third parties | The Yandex map iframe is the heaviest asset on the page. It must never block first paint. |

## Checks before shipping a visual change

1. **Unused fonts.** Every family in `layout.tsx` must appear in `globals.css`. Two
   Geist families were shipped for months without a single reference — grep before
   adding, and grep again before removing.
2. **Unused CSS.** Replacing a section means deleting its rules. Two superseded hero
   implementations left ~800 lines of dead CSS behind.
3. **Duplicate rules.** `globals.css` carries a second styling pass that re-declares
   about half of its top-level rules. It is dead weight in the payload and a trap when
   editing — the later declaration wins.
4. **Image formats.** The gallery JPEGs are the largest static assets. AVIF/WebP
   through `next/image` is automatic, but the *source* files should still be sized to
   what the layout actually needs.
5. **Priority count.** The scene image wall marks several columns `priority`. Each one
   is a render-blocking preload; keep it to the images actually on the first screen.

## Core Web Vitals, in this project's terms

- **LCP** — the hero image inside the first scene. Keep it `priority`, keep its
  `sizes` honest, and do not put a webfont-dependent headline in front of it.
- **CLS** — every image is `fill` inside a sized parent, so layout is stable. The risk
  is the scroll scenes: a pinned trigger whose distance is a stale literal shifts
  content after resize. Every trigger declares `invalidateOnRefresh`.
- **INP** — the price filters re-render a large subtree on every tab change. Keep the
  per-frame scroll callbacks free of layout reads (`innerWidth`/`innerHeight` cached
  on refresh, never read in `onUpdate`).

## Local SEO — currently the biggest gap

`layout.tsx` sets only `title` and `description`. Missing, in order of impact:

1. **`LocalBusiness` / `BeautySalon` JSON-LD** — name, address (Москва, Коммунарка,
   ул. Бачуринская, 11а к1), `telephone`, `openingHours` (Пн–Вс 10:00–21:00),
   `geo`, `priceRange`, `aggregateRating` (5.0 / 119). This is what puts a studio in
   the local pack.
2. **`metadataBase`, `openGraph`, `twitter`** with a real share image — every link
   shared in a messenger currently previews as bare text.
3. **`canonical`**, `robots.ts`, `sitemap.ts`.
4. **Heading order** — one `h1`, then `h2` per chapter. Scene headlines currently use
   `h2`/`h3` inside decorative sections; check the outline is not broken.
5. **Service-level content** — a page or section per major service is what ranks for
   "лазерная эпиляция коммунарка", not a single scroll page.

Keep business data exact: address, phone, hours, prices and the rating are facts, not
copy to be improved.

## Deferring the heavy things

- **Map**: render a static preview and swap in the iframe on click. It is the single
  biggest win available on this page.
- **Video**: `preload="metadata"`, a real poster image, and no autoplay with sound.
- **Scenes**: built after `document.fonts.ready`, below the first screen, so they do
  not compete with the hero paint. Keep it that way.
