# Motion layer

One animation library (GSAP + ScrollTrigger + SplitText), one scroll driver (Lenis),
one place they are started. Adding a second of either is the usual cause of animations
that work until you resize, navigate or return to the tab.

```
tokens.ts           easing, duration, distance, scroll budgets — the shared vocabulary
reveal.ts           declarative entrances driven by data-* attributes
scenes/             the hand-built pinned/scrubbed sequences, one file each
useViartMotion.ts   the driver: Lenis, gsap.ticker, matchMedia, refresh, teardown
```

| Scene | Chapter | Adapted from |
|---|---|---|
| `heureBleue` | hero image wall | in-house |
| `capsules` | `#services` — the two directions | [capsules-animated-columns](https://motionprompts.dev/component/capsules-animated-columns/) |
| `everlasSpotlight` | `#everlas` — four states of a course | [prototypestudio-scroll-animation](https://motionprompts.dev/component/prototypestudio-scroll-animation/) |
| `turboDissolve` | `#turbo` — the one WebGL scene | [ironhill-scroll-animation](https://motionprompts.dev/component/ironhill-scroll-animation/) |
| `galleryMosaic` | `#gallery` — 3×3 clip-path tiles | [mask-reveal](https://motionprompts.dev/component/mask-reveal/) |
| `videoGrow` | `#video` — plate grows into frame | [vucko-scroll-animation-javascript](https://motionprompts.dev/component/vucko-scroll-animation-javascript/) |
| `stickyCards` | `#promo` — the complexes deck | [sticky-cards-ashfall-rebuild-js](https://motionprompts.dev/component/sticky-cards-ashfall-rebuild-js/) |
| `bookingRevealer` | reviews → booking wipe | [epic-scroll-anims-scrolltrigger-gsap](https://motionprompts.dev/component/epic-scroll-anims-scrolltrigger-gsap/) |

An adapted scene's numbers are **transcribed, not chosen**: thresholds, phase
lengths, clip-path tables, travel formulas and scroll budgets come from the source
and are part of how it behaves. Content, media, palette, type, the React
integration and the responsive/reduced-motion composition are ours. If you change
a threshold, you are no longer running that component.

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

1. Write it as a function in `scenes/<name>.ts` that takes the page root, scopes
   every lookup to it, and returns early if its markup is absent. Export it from
   `scenes/index.ts`.
2. Take every number from `tokens.ts`; a literal in a callback is how distances go
   stale.
3. Declare `invalidateOnRefresh: true`, and make any viewport-dependent `end` a
   function.
4. Cache layout reads in `onRefresh` — never read `innerWidth`/`innerHeight` per frame.
5. Call it from the phase-2 block in `useViartMotion.ts`, inside the matchMedia branch.
6. Reserve its scroll space in CSS, and collapse that space in the
   `prefers-reduced-motion` block.
7. Return a teardown for anything `gsap.context` cannot see. It records tweens
   and triggers made while the factory runs — and nothing else. Not a `rAF` loop,
   not a `WebGLRenderer`, not DOM you injected, not a `SplitText`, not a plain
   `addEventListener`, and not the inline styles a trigger's `onUpdate` writes
   later, from a callback the context was never inside.

A scene owns its DOM: no `data-reveal` inside it.

Adapting an external scene adds two habits. Its selectors assume it owns the
document, so scope every one of them. And its entry point assumes it runs once and
never unwinds: under StrictMode the effect mounts twice, and setup without teardown
leaves two pins on one section, two phase counters disagreeing about which phase
the columns are in, or a second WebGL context the browser will eventually refuse
to grant.

## Rules the driver enforces

- Nothing is built under `prefers-reduced-motion: reduce`.
- Entrances hide before the first paint; anything that measures text waits for
  `document.fonts.ready`.
- Programmatic scrolling goes through `scrollTo()`, anchors through the Lenis
  `anchors` option, scroll locking through `setScrollLocked()`.
- `ScrollTrigger.refresh()` runs again once late images have settled.
- There is no `scroll-behavior: smooth` in the CSS, on purpose.
