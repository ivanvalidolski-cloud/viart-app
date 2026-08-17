---
name: frontend-design
description: Design system and visual taste rules for the ViART site — colour tokens, type scale, spacing grid, component patterns, motion language and anti-generic-AI rules. Use whenever building, restyling or reviewing any UI in this project (sections, cards, buttons, forms, layouts, animations).
---

# ViART frontend design

The ViART site is a warm-dark, editorial, "precision instrument" landing page for a
laser hair removal and body-massage studio in Kommunarka, Moscow. It must read as an
agency-built brand site, not as a template.

**All visual truth lives in `app/globals.css`.** Read the relevant block there before
writing any new CSS. Never introduce a second styling system (no ad-hoc Tailwind
utility soup on top of the existing BEM-ish class names).

## 1. Colour tokens — never invent hex values

```
--warm-black    #0c0907   page ground, header when solid
--ink           #120d0a   deepest panels
--espresso      #1a110d   raised surface
--cocoa         #271914   card / panel surface
--walnut        #3a261d   surface accent, borders on warm panels
--bronze        #9f7757   accent, active states
--bronze-soft   #c09a78   accent on hover, eyebrow text, selection
--ivory         #f1eadf   primary text, primary button fill
--muted         #a99b8f   secondary text
--hairline          rgba(241,234,223,0.14)   1px dividers
--hairline-strong   rgba(241,234,223,0.28)   1px borders on interactive
```

Rules:
- Text on the dark ground is `--ivory`; anything secondary is `--muted`. No pure
  `#fff` and no pure `#000` anywhere.
- Accent is bronze only. No blue, no purple, no gradients-as-decoration.
- Borders are always 1px hairlines, never 2px+, never rounded pills unless an
  existing component already is.
- New colours must be added as a token in `:root`, not inlined at the call site.

## 2. Typography

Two families, loaded in `app/layout.tsx` via `next/font`:
- `var(--font-onest)` — everything readable (headings, body, buttons).
- `var(--font-martian)` — monospace, **only** through the `.tech-label` class:
  0.62rem, uppercase, `letter-spacing: 0.09em`. Used for section indices
  (`03 / SERVICES & PRICES`), metadata and micro-captions. It is the signature of
  the brand — do not use it for body copy, and do not add a third font.

Fluid scale, all with `clamp()` — pick the nearest existing step instead of a new size:

| Role | Size |
|---|---|
| Hero h1 | `clamp(3.8rem, 7.2vw, 7.8rem)` |
| Chapter h2 | `clamp(2.65rem, 4.4vw, 5rem)` … `clamp(3.5rem, 6.5vw, 7.6rem)` for display chapters |
| Sub-heading h3 | `clamp(1.25rem, 1.8vw, 1.85rem)` |
| Lead paragraph | `clamp(1rem, 1.25vw, 1.18rem)` |
| Body | `0.95–1rem` |
| Eyebrow (`.eyebrow`) | `0.72rem`, uppercase, `--bronze-soft` |
| `.tech-label` | `0.62rem` |

Headings use tight tracking (`letter-spacing: -0.02em … -0.04em`) and line-height
`0.95–1.05`. Body copy runs `1.55–1.65` with a max measure of ~62ch.

## 3. Spacing & layout

- Base unit **8px (0.5rem)**. Use 0.5 / 0.75 / 1 / 1.5 / 2 / 3 / 4 / 6rem. No `13px`.
- Page inset is always `var(--page-gutter)` (`max(1.5rem, (100vw - 92rem)/2)`), never
  a hand-rolled `margin: 0 auto; max-width:`.
- Grid gutter is `var(--grid-gap)`.
- Section rhythm: `.chapter { padding: clamp(5.5rem, 9vw, 10rem) var(--page-gutter); }`
  New sections reuse `.chapter`.
- Every section carries a numbered index (`.chapter-index.tech-label`,
  `NN / NAME IN ENGLISH`) — continue the numbering, currently 01…10.
- Alignment comes from an explicit parent `grid`/`flex`, never from auto-margins or
  implicit sizing. Verify the whole layout path (element → parent → responsive
  override) before declaring a layout change done.
- Breakpoints in use: `1100px`, `899px`, `640px`. Any new rule must be checked at all
  three plus desktop.

## 4. Component patterns

- **Primary CTA** — `.button.button--ivory`: ivory fill, warm-black text, hover to
  `--bronze-soft`. There is exactly one primary CTA per screenful.
- **Secondary CTA** — `.button.button--outline`: hairline border, inverts on hover.
- **Tertiary** — `.text-link` / `.text-button` with a trailing arrow glyph
  (`↗ ↘ ↑ ↻`). Arrows carry direction meaning: `↗` external/booking, `↘` scroll down,
  `↑` back up.
- **Interactive minimum height** 2.35rem in the header, 3.45rem for buttons — never
  smaller, tap targets stay ≥44px on mobile.
- **Segmented control** (`.segmented-control`) for binary choice (Женщины/Мужчины);
  vertical numbered list (`01 …`) for category choice.
- **Price row** (`.service-line`): name — dotted/hairline rule — price — `↗` booking
  link. Keep the four-part rhythm when adding rows.
- **Focus** is global: `1px solid var(--ivory)` outline, `4px` offset. Never remove it.
- Booking always points at `bookingUrl` (Yclients) with `target="_blank" rel="noopener"`.

## 5. Motion language (Framer Motion / `motion` package)

Primitives live in `app/components/motion.tsx`: `Reveal`, `RevealGroup`, `RevealChild`.

- Use the `as` prop and keep the element's original `className`. **Never wrap an
  element in an extra `<div>`** — the CSS grids in `globals.css` place direct children.
- Entrance = fade + ≤26px rise, `700ms`, ease `[0.22, 0.61, 0.36, 1]`, `once: true`.
  Large media fades only (`distance={0}`) — big images sliding looks cheap.
- Stagger step `0.07–0.09s`, max ~6 items in a chain.
- Hover/press feedback stays in CSS (`transition: … 160–220ms ease`). Do not duplicate
  a CSS transition in JS.
- These elements already own a CSS keyframe animation and must **not** be given a
  motion reveal: `.price-content` (`stateIn`), `.active-review` (`reviewIn`),
  `.gallery-media` (`warmOpticalExchange`), `.media-continuity` (`continuity*`),
  `.hero-trace`, `.scan-line`, `.turbo-wave`, `.closure-trace` (ambient loops).
- `prefers-reduced-motion` must collapse the reveal to an instant appearance — the
  primitives already do this via `useReducedMotion()`; keep it that way for anything new.
- No parallax on text, no scroll-jacking, no bouncy springs, no infinite motion in the
  reading path.

## 6. Anti-generic-AI checklist

Reject the default "AI landing page" look:
- ❌ purple/indigo gradients, glassmorphism cards, emoji as icons, 3-column
  feature grids of identical rounded cards, `shadow-2xl`, generic stock imagery.
- ❌ centred everything. ViART is asymmetric — text column offset against a large
  media block, headings hard-left.
- ❌ hero copy like "Elevate your beauty journey". Copy is Russian, factual, calm,
  and never promises a medical result.
- ✅ real photography from `public/images/`, hairlines instead of shadows, generous
  negative space, monospace metadata, numbered chapters, asymmetric grids.

## 7. Content & correctness rules

- All user-facing copy is Russian; `.tech-label` metadata is English uppercase.
- Prices, service names and the 30% first-visit discount are business data — copy them
  exactly, never invent or "round" a price, never invent a service.
- Do not add medical claims ("удаление навсегда", "лечение"). Wording stays
  "помогает сократить рост волос".
- Keep `alt` text descriptive and Russian; decorative layers get `aria-hidden="true"`.
- Images go through `next/image` with an explicit `sizes`; only the hero is `priority`.
