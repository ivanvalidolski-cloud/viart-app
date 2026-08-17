---
name: motion-system
description: How animation is built on the ViART site — the GSAP + ScrollTrigger + Lenis architecture, the declarative data-reveal system, the rules that keep scenes from fighting each other, and the failure modes to check before shipping. Use for any scroll animation, entrance, pinned sequence, hover motion or animation bug.
---

# ViART motion system

One animation library (**GSAP** + ScrollTrigger + SplitText), one scroll driver
(**Lenis**), one place they are started (`app/lib/motion/useViartMotion.ts`).
A second animation library, a second Lenis instance, or a tween created outside the
shared context is the usual cause of "it works until you resize / navigate / come back
to the tab". Do not add Framer Motion, AOS, Locomotive or `IntersectionObserver`
one-offs alongside this.

```
app/lib/motion/
  tokens.ts            easing, duration, distance, scroll budgets — the vocabulary
  reveal.ts            declarative entrances driven by data-* attributes
  scenes.ts            hand-built pinned/scrubbed sequences
  useViartMotion.ts    the driver: Lenis, ticker, matchMedia, refresh, teardown
```

## Two tiers, and the line between them

**Tier 1 — reveals.** Everything below the fold. Adding one is a markup change:

```tsx
<div className="studio-copy" data-reveal="">…</div>
<figure className="studio-main-media" data-reveal="media">…</figure>
<h2 data-reveal="mask">…</h2>
<ol className="fact-stages" data-reveal="group">
  <li data-reveal-item="">…</li>
</ol>
<div data-reveal="" data-reveal-delay="0.12">…</div>
```

| Attribute | Effect |
|---|---|
| `data-reveal=""` | fade + 26px rise |
| `data-reveal="media"` | fade only — large images must never slide |
| `data-reveal="mask"` | headline rises line by line from behind a mask |
| `data-reveal="group"` | staggers this element's `[data-reveal-item]` children |
| `data-reveal-delay` | extra seconds before the entrance |

No JavaScript is written for a tier-1 animation. If you find yourself writing a
`ScrollTrigger` for a fade, use the attribute instead.

**Tier 2 — scenes.** The pinned, scrubbed hero sequences in `scenes.ts`. Expensive,
hand-built, and deliberately rare.

Rules that keep the tiers from colliding:
1. A scene owns every element inside it. **No `data-reveal` may appear inside a
   scene's DOM** — otherwise two systems animate the same node's transform.
2. Only one scene is pinned at a time, and scenes live above the fold. Their scroll
   budget comes from `SCENE` tokens, never from a literal in the callback.
3. Elements with an ambient CSS keyframe animation get no JS animation on the same
   property.
4. Everything is created inside the driver's `gsap.matchMedia()` so teardown is
   automatic. Never call `ScrollTrigger.create` from a component.

## Non-negotiables

- **Reduced motion.** `useViartMotion` builds nothing when
  `prefers-reduced-motion: reduce` matches. Any scene whose markup reserves scroll
  space must collapse that space in the reduced-motion CSS block — a scrub spacer
  left at `250vh` becomes two screens of nothing to scroll past.
- **Hidden state is applied before the first paint.** Entrances are built
  synchronously in a layout effect. Anything that measures text (SplitText) waits for
  `document.fonts.ready`, because splitting against the fallback face measures the
  wrong line boxes. Never defer the *hiding* — the section would appear, disappear,
  and fade back in.
- **No CSS `scroll-behavior: smooth`.** Lenis animates the scroll position itself;
  the CSS behaviour animates the same value at the same time and the page stutters.
- **All programmatic scrolling goes through Lenis** — `scrollTo()` from the hook, and
  in-page anchors via the Lenis `anchors` option. `scrollIntoView({behavior:'smooth'})`
  fights the driver.
- **Scroll locking goes through Lenis** — `setScrollLocked()`. `overflow: hidden` on
  the body does not stop Lenis, so an open menu would sit still while the page moved
  underneath it.
- **Never read layout in a per-frame callback.** `window.innerWidth/innerHeight` in
  `onUpdate` forces a reflow every tick. Cache in `onRefresh`.
- **Every trigger declares `invalidateOnRefresh`,** and any `end` that depends on
  viewport size is a function, not a literal — otherwise the distance freezes at the
  height the page had on first load and drifts when mobile browser chrome resizes.
- **Refresh after late images.** `next/image` below the fold decodes after hydration
  and moves every trigger's start/end. The driver already re-refreshes once all images
  settle; keep that if you touch it.

## The taste rules

- Entrance = fade + ≤26px rise, ~700ms, `power3.out`, fires once. Large media fades.
- Stagger step 0.07–0.09s, at most ~6 items in a chain.
- Restraint reads as expensive. A site where everything moves reads as cheap.
- Banned: scroll-jacking, parallax on body text, springy overshoot, infinite motion
  in the reading path, custom cursors, anything that delays a click.

## Debugging checklist

When an animation misbehaves, check in this order:

1. Is the element inside a scene *and* carrying `data-reveal`? (two owners)
2. Does the trigger have `invalidateOnRefresh`, and is a viewport-dependent `end` a
   function? (stale distances after resize)
3. Did images load after the triggers were built? (`ScrollTrigger.refresh()`)
4. Is `ScrollTrigger.update` still wired to `lenis.on('scroll')`? (frozen scrub)
5. Is a duration/easing hard-coded instead of coming from `tokens.ts`? (drift)
6. Add `markers: true` to the trigger — never commit it.
