# Motion layer

One animation library (GSAP + ScrollTrigger + SplitText), one scroll driver (Lenis),
one place they are started. Adding a second of either is the usual cause of animations
that work until you resize, navigate or return to the tab.

```
tokens.ts           easing, duration, distance, scroll budgets — the shared vocabulary
reveal.ts           declarative entrances driven by data-* attributes
scenes.ts           the two hand-built pinned/scrubbed hero sequences
useViartMotion.ts   the driver: Lenis, gsap.ticker, matchMedia, refresh, teardown
```

## Adding an entrance

Markup only — no JavaScript:

```tsx
<div className="studio-copy" data-reveal="">…</div>
<figure className="studio-main-media" data-reveal="media">…</figure>
<h2 data-reveal="mask">…</h2>
<ol data-reveal="group">
  <li data-reveal-item="">…</li>
</ol>
<div data-reveal="" data-reveal-delay="0.12">…</div>
```

| Attribute | Effect |
|---|---|
| `data-reveal=""` | fade + 26px rise |
| `data-reveal="media"` | fade only — large images must not slide |
| `data-reveal="mask"` | headline rises line by line from behind a mask |
| `data-reveal="group"` | staggers this element's `[data-reveal-item]` children |
| `data-reveal-delay` | extra seconds before the entrance |

`mask` needs breathing room at these tight leadings — `.reveal-line` in `globals.css`
adds `padding-bottom: 0.14em` so Cyrillic descenders are not clipped by the mask.

## Adding a scene

Scenes are rare and expensive. Before writing one, check it is not a reveal in
disguise. If it really is a scene:

1. Write it as a function in `scenes.ts` that takes its root element.
2. Take every number from `tokens.ts`; a literal in a callback is how distances go
   stale.
3. Declare `invalidateOnRefresh: true`, and make any viewport-dependent `end` a
   function.
4. Cache layout reads in `onRefresh` — never read `innerWidth`/`innerHeight` per frame.
5. Call it from the phase-2 block in `useViartMotion.ts`, inside the matchMedia branch.
6. Reserve its scroll space in CSS, and collapse that space in the
   `prefers-reduced-motion` block.

A scene owns its DOM: no `data-reveal` inside it.

## Rules the driver enforces

- Nothing is built under `prefers-reduced-motion: reduce`.
- Entrances hide before the first paint; anything that measures text waits for
  `document.fonts.ready`.
- Programmatic scrolling goes through `scrollTo()`, anchors through the Lenis
  `anchors` option, scroll locking through `setScrollLocked()`.
- `ScrollTrigger.refresh()` runs again once late images have settled.
- There is no `scroll-behavior: smooth` in the CSS, on purpose.
