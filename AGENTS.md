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

A later explicit user request overrides these defaults.
