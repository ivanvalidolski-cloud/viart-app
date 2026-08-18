/**
 * Cinematic scenes — the hand-built, pinned/scrubbed sequences.
 *
 * Rules that keep scenes from fighting each other and the rest of the page:
 *  - A scene owns every element inside it. No `data-reveal` may appear within
 *    a scene's DOM, or the two layers animate the same node.
 *  - Only one scene is pinned at a time. Scenes run in document order, and
 *    their scroll budget comes from the tokens, never from a literal.
 *  - Motion decays down the page. Below the price list there is exactly one
 *    signature moment — the EVERLAS stage — the procedure sequence continues
 *    out of it, and everything after that is ordinary flow with, at most, a
 *    one-shot entrance. Do not add a second pinned showpiece down there.
 *  - Every trigger declares `invalidateOnRefresh`, and any `end` that depends
 *    on the viewport is a function — a literal freezes at the height the page
 *    had on first load.
 *  - Per-frame callbacks never read layout (`innerWidth`/`offsetHeight`) —
 *    those are cached on refresh. Reading them per tick forces a reflow.
 *  - A scene is built inside the driver's `matchMedia` and may return a
 *    teardown for whatever `gsap.context` cannot see: rAF loops, DOM it
 *    injected, SplitText instances, plain listeners, and inline styles written
 *    from a trigger callback rather than from setup.
 *
 * Where a scene is an adaptation of a named external source, the URL and what
 * was and was not adapted are at the top of that module.
 */

export { createHeureBleueScene } from './heureBleue';
export { createCapsulesScene } from './capsules';
export { createEverlasStageScene } from './everlasStage';
export { createProcedureSequenceScene } from './procedureSequence';
export { createGalleryMosaicScene } from './galleryMosaic';
