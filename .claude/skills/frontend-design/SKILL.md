---
name: frontend-design
description: Design system and visual taste rules for the ViART site — colour tokens, type scale, spacing grid, component patterns and anti-generic-AI rules. Use whenever building, restyling or reviewing any UI in this project (sections, cards, buttons, forms, layouts).
---

# ViART frontend design

ViART is a laser hair removal and body-massage studio in Kommunarka, Moscow. The site
is warm-dark, editorial and photography-led: a display serif against a gold accent on
near-black, with monospace metadata. It must read as an agency-built brand site.

**Visual truth lives in `app/globals.css`; motion truth lives in `app/lib/motion/`.**
Read the relevant block before writing anything new.

> ⚠️ `globals.css` currently carries **two styling passes**: an original layer and a
> later "Global Correction" layer appended at the end that re-declares ~187 of 378
> top-level rules. **The later declaration wins.** Before editing a rule, grep for the
> selector across the whole file and edit the *last* occurrence, or your change will
> have no effect. Do not assume the first match is the live one.

## 1. Colour tokens — never invent hex values

```
--warm-black    #100905   page ground
--ink           #0d0704   deepest panels, header when solid
--espresso      #120b07   raised surface
--cocoa         #1e150e   card / panel surface
--walnut        #2a1c11   surface accent
--bronze        #c9a84c   gold accent — active states, rules
--bronze-soft   #d3b561   accent on hover, eyebrow text, selection
--ivory         #f4ecd8   primary text, primary button fill
--muted         #b8a898   secondary text
--hairline          rgba(201, 168, 76, 0.2)    1px dividers
--hairline-strong   rgba(201, 168, 76, 0.34)   1px borders on interactive
```

- Text on the dark ground is `--ivory`; secondary is `--muted`. No pure `#fff`/`#000`.
- The accent is warm gold. No blue, no purple, no decorative gradients.
- Borders are 1px hairlines. Radii stay small (`0.4rem` on buttons); nothing is a pill.
- A new colour becomes a token in `:root` first, never an inline hex.

## 2. Typography

Three families, loaded in `app/layout.tsx` via `next/font` (all with the Cyrillic
subset — a font without Cyrillic is unusable here):

| Variable | Face | Used for |
|---|---|---|
| `--font-display` | Playfair Display | `h1 h2 h3`, `.site-logo`, `.footer-wordmark`, `.quote-mark`, `.eyebrow`, blockquote |
| `--font-onest` | Onest | body, buttons, controls, everything else |
| `--font-martian` | Martian Mono | `.tech-label` metadata only |

Every serif declaration keeps `Georgia, "Times New Roman", serif` as its fallback.
Never introduce a fourth family, and never use a bare system-font stack for display
text — Georgia is absent on Android, so the headline silently changes face.

Scale (fluid, all `clamp()` — reuse a step rather than inventing a size):

| Role | Size | Notes |
|---|---|---|
| Hero h1 | `clamp(3.6rem, 5.6vw, 6.7rem)` | weight 400, `max-width: 13.5ch` |
| Chapter h2 | `clamp(3rem, 5vw, 5.6rem)` | weight 600, tracking `-0.045em`, leading `0.98` |
| Scene headline | `clamp(2rem, 5vw, 8rem)` | leading `0.8`, uppercase |
| Eyebrow | `0.95rem` italic serif | colour `--bronze-soft` |
| Button label | `0.7rem` uppercase | tracking `0.09em`, weight 600 |
| `.tech-label` | `0.62rem` uppercase mono | tracking `0.09em` |

Headlines run tight (`-0.045em … -0.065em`, leading `0.8–0.98`). Body runs `1.55–1.65`
with a measure around 62ch.

**Tight leading and masked text conflict.** Any headline that gets a line-mask reveal
needs `padding-bottom: 0.14em` on the line (see `.reveal-line` in `globals.css`), or
Cyrillic descenders — у р д ц щ — are clipped by the mask.

## 3. Spacing & layout

- Base unit **8px**. Use 0.5 / 0.75 / 1 / 1.5 / 2 / 3 / 4 / 6rem. No `13px`.
- Page inset is `var(--page-gutter)`; grid gutter is `var(--grid-gap)`. Never
  hand-roll `max-width` + `margin: 0 auto`.
- Section rhythm: `.chapter { padding: clamp(5rem, 7vw, 8rem) var(--page-gutter) }`.
  New sections reuse `.chapter`.
- Alignment comes from an explicit parent grid/flex, never auto-margins or implicit
  sizing. Verify the full path — element → parent → responsive override → the second
  styling pass — before calling a layout change done.
- Breakpoints in use: `1099px`, `1000px`, `899px`, `640px`. Check all of them.

## 4. Component patterns

- **Primary CTA** `.button.button--ivory` — ivory fill, dark text. One per screenful.
- **Secondary** `.button.button--outline` — hairline border, inverts on hover.
- **Tertiary** `.text-link` / `.text-button` with a trailing arrow. Arrows carry
  meaning: `↗` external/booking, `↘` scroll down, `↑` back up, `↻` retry.
- **Tap targets** ≥ 2.8rem on buttons, ≥ 2.35rem in the header, ≥ 44px on mobile.
- **Segmented control** for a binary choice; a vertical list for categories.
- **Price row** `.service-line`: name — hairline rule — price — `↗`. Keep all four.
- **Focus** is global: `1px solid var(--ivory)`, `4px` offset. Never remove it.
- Booking always points at `bookingUrl` with `target="_blank" rel="noopener"`.

## 5. Motion

Motion has its own architecture — see `app/lib/motion/README.md` and the
`motion-system` skill. The short version for design work:

- Adding an entrance to an ordinary section is a **markup** change: `data-reveal`.
- Never hand-write a duration, easing or distance; they live in `motion/tokens.ts`.
- Hover and press feedback stays in CSS transitions, 160–220ms.
- Reduced motion must always degrade to an instant appearance.

## 6. Anti-generic-AI checklist

- ❌ purple/indigo gradients, glassmorphism, emoji icons, three identical rounded
  cards in a row, `shadow-2xl`, stock imagery, centred everything.
- ❌ hero copy like "Раскройте свою красоту". Copy is Russian, factual and calm.
- ✅ real photography from `public/images/`, hairlines instead of shadows, generous
  negative space, asymmetric grids, a display serif against monospace metadata.

## 7. Content & correctness rules

- User-facing copy is Russian; `.tech-label` metadata is English uppercase.
- Prices, service names and the 30% first-visit discount are business data. Copy them
  exactly. Never invent, round or "improve" a price or a service.
- No medical claims ("удаление навсегда", "лечение"). Keep "помогает сократить рост
  волос".
- `alt` text is descriptive and Russian; decorative layers get `aria-hidden="true"`.
- Images go through `next/image` with an explicit `sizes`; only above-the-fold art
  gets `priority`.
