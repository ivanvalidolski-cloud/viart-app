# Fast code-only workflow

Optimize for implementation speed in this Next.js project.

- Implement requested changes directly and inspect only the files needed for the edit.
- Do not launch the app, development server, browser, or localhost.
- Do not run builds, tests, linters, type checks, formatters, or other verification commands unless explicitly requested.
- Do not routinely read `node_modules/next/dist/docs/`. Consult the local Next.js documentation only when the task depends on an unfamiliar or version-specific API and cannot be implemented reliably from existing project patterns.
- Do not browse the web unless explicitly requested or required by a higher-priority instruction.
- Keep updates brief, make reasonable assumptions, and leave visual verification to the user.
- For small UI and alignment changes, statically verify the complete layout path before finishing: inspect the edited element, its parent layout, selector specificity/order, and relevant responsive overrides.
- Do not infer that a visual result is correct from a single CSS declaration. Confirm that the final cascade and containing layout can actually produce the requested position at both desktop and mobile breakpoints, without launching the site.
- For image-crop adjustments, use one named crop control and do not mix `top`, element resizing, `transform`, and `object-position` as competing positioning mechanisms. Before increasing a pixel crop offset, verify that the rendered image has enough overflow to keep the frame covered; add controlled image scale first when more travel is required. Keep hover and responsive overrides tied to the same crop model.
- Prefer an explicit parent grid/flex layout when alignment depends on the surrounding container; avoid relying on fragile implicit sizing or auto margins when a deterministic layout rule is available.
- Preserve unrelated changes and avoid destructive operations.

## Skills

Read the relevant skill in `.claude/skills/` before starting; they carry this
project's real tokens, architecture and constraints.

| Skill | Covers |
|---|---|
| `frontend-design` | colour tokens, type scale, spacing, component patterns, anti-generic-AI rules |
| `motion-system` | the GSAP/Lenis architecture, `data-reveal`, scene rules, animation bugs |
| `component-import` | adapting a 21st.dev / shadcn / pasted block to this system |
| `ux-review` | booking path, price discovery, mobile behaviour, conversion |
| `accessibility` | keyboard, focus, reduced motion, screen-reader semantics, contrast |
| `performance-seo` | image/font budgets, Core Web Vitals, local business metadata |

## Animation

- One animation library: **GSAP** (+ ScrollTrigger, SplitText) with **Lenis** as the
  scroll driver. Do not add a second one. The whole layer lives in `app/lib/motion/`
  and is started once from `useViartMotion`.
- Adding an entrance is a markup change — `data-reveal`, `data-reveal="media"`,
  `data-reveal="mask"`, `data-reveal="group"` + `data-reveal-item`. Do not hand-write
  a ScrollTrigger for a fade.
- Durations, easings, distances and scroll budgets come from `motion/tokens.ts`.
- Hover and press feedback stays in CSS transitions.
- `prefers-reduced-motion` builds nothing, and any scroll space a scene reserves must
  collapse in the reduced-motion CSS block.
- There is no `scroll-behavior: smooth` in the CSS on purpose — Lenis owns the scroll
  position. Programmatic scrolling goes through the hook's `scrollTo`.

## Stylesheet caution

`app/globals.css` carries two styling passes: an original layer and a later "Global
Correction" layer appended at the end that re-declares roughly half of the top-level
rules. **The later declaration wins.** Grep the selector across the whole file and
edit the last occurrence, or the change will appear to do nothing.

## MCP

The `magic` MCP server (21st.dev) is configured in `.mcp.json` and needs
`TWENTY_FIRST_API_KEY` in the environment; it is optional — components can be pasted
in by hand instead.

A later explicit user request overrides these defaults.
