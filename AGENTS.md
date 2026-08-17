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

## Design & motion stack

- Any UI work (new section, restyle, layout or animation change) follows the
  `frontend-design` skill in `.claude/skills/frontend-design/`. It holds the colour
  tokens, type scale, 8px spacing grid, component patterns and the "no generic AI
  aesthetic" rules. Read it before writing CSS.
- Any component copied in from 21st.dev, shadcn or another site goes through the
  `component-import` skill in `.claude/skills/component-import/`.
- All animation uses Framer Motion (the `motion` package) through the shared
  primitives in `app/components/motion.tsx`: `Reveal`, `RevealGroup`, `RevealChild`.
  Scroll-triggered fades, staggered reveals, `once: true`, and a fade + ≤26px rise;
  large media fades only. Pass `as` and keep the element's own `className` — never add
  a wrapper `<div>`, because the grids in `globals.css` place direct children.
- Hover and press feedback stays in CSS transitions. Ambient/CSS-keyframe elements
  (`.price-content`, `.active-review`, `.gallery-media`, `.media-continuity`,
  `.hero-trace`, `.turbo-wave`) must not be given a second animation in JS.
- `prefers-reduced-motion` must always degrade a reveal to an instant appearance.
- The `magic` MCP server (21st.dev) is configured in `.mcp.json` and needs
  `TWENTY_FIRST_API_KEY` in the environment; it is optional — components can be pasted
  in by hand instead.

A later explicit user request overrides these defaults.
