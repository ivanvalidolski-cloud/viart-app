---
name: accessibility
description: Accessibility rules and review checklist for the ViART site — keyboard paths, focus, reduced motion, screen-reader semantics for the gallery, video and price filters, contrast against the warm-dark palette. Use when adding an interactive component, reviewing a section, or when asked about a11y, keyboard, screen readers or WCAG.
---

# ViART accessibility

The site is a single Russian-language page with several custom interactive widgets
(price filters, an optical gallery, a video player, a mobile menu) and two heavy
scroll sequences. Those are exactly the parts that break for keyboard and
screen-reader users, so they carry the rules.

## Non-negotiables

- **Focus is never removed.** The global `:focus-visible` outline is
  `1px solid var(--ivory)` at `4px` offset. If a component needs a different
  treatment it still needs a visible one.
- **Everything works from the keyboard.** Tab reaches every control in visual order;
  Enter/Space activate; Escape closes anything overlaid.
- **`prefers-reduced-motion: reduce` disables the scroll scenes entirely** and
  collapses the scroll space they reserve. Verify in DevTools → Rendering → Emulate
  CSS media, not by reading the code.
- **Language is Russian** (`<html lang="ru">`). Any English metadata label inside
  Russian content should not be announced as Russian — prefer `aria-hidden` on purely
  decorative labels.
- **Touch targets ≥ 44px.** The design tokens already meet this; new controls must too.

## Per-component rules

**Mobile menu** — the toggle carries `aria-expanded` and a Russian `aria-label`. While
open: page scroll is locked through `setScrollLocked` (Lenis ignores `overflow:hidden`),
Escape closes it, focus is trapped inside, and focus returns to the toggle on close.

**Price filters** — the segmented control and category buttons are real `<button>`s
with `is-active` reflected to assistive tech (`aria-pressed`, or a
`role="tablist"`/`tab`/`tabpanel` set if they become true tabs). A disabled category
uses the `disabled` attribute, not a visual grey.

**Gallery** — the stage is a focusable group with `aria-roledescription`, arrow-key
navigation and swipe. Each frame is a `<button>` with `aria-pressed` and a Russian
label naming its position ("Выбрать кадр 3 из 4"). Only the active frame carries real
`alt` text; the inactive ones take `alt=""` so the same photo is not announced four
times. Position changes are announced through a polite live region.

**Video** — native controls appear once playback is intentional. The play button has a
state-specific Russian label (воспроизвести / продолжить / посмотреть снова). The
error state is a `role="alert"` with a retry control, not a silent poster.

**Scroll scenes** — decorative image walls are `aria-hidden="true"`. The copy inside a
scene must exist as real text in the DOM, never baked into an image, and must remain
readable when the scene does not run.

**Images** — descriptive Russian `alt`; `alt=""` plus `aria-hidden` for decoration.
Never an empty `alt` on a photo that carries meaning.

## Contrast on this palette

Body text is `--ivory` `#f4ecd8` on `--warm-black` `#100905` — comfortably above 4.5:1.
Two places need checking whenever they change:

- `--muted` `#b8a898` on the dark ground — fine for body size, marginal for anything
  under 0.75rem. Do not use it for small metadata on a lighter panel.
- `--bronze` `#c9a84c` gold on `--ivory` — this pairing fails at body size. Gold is an
  accent on dark, not text on light. The `.vv-hero` scene has an ivory ground, so any
  gold text placed there must be checked.

Check contrast against the *winning* declaration — `globals.css` has two styling
passes and the later one wins.

## Review checklist

1. Tab through the whole page: is the order visual, is focus always visible, is
   anything reachable but invisible?
2. Escape from the mobile menu; focus returns to the toggle.
3. Emulate `prefers-reduced-motion: reduce`: no pinned scenes, no long empty scroll,
   all content present.
4. Zoom to 200%: nothing clipped, no horizontal scroll.
5. Screen reader on the gallery and price filters: is the current state announced?
6. Every interactive element: is it a real `<button>`/`<a>`, not a `<div>` with a
   click handler?
