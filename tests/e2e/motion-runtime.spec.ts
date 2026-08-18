import { expect, test } from '@playwright/test';
import { PINNED, ViartPage } from './pages/ViartPage';
import { framesAcross, idleDrift, settle } from './support/scroll';

/**
 * The motion layer's runtime contract.
 *
 * Not a visual suite — nothing here judges how the page looks. Each test states
 * one property the scroll system must hold no matter what the scenes are doing:
 * the triggers stay alive, the document keeps its length, the pins actually pin
 * without dropping a frame, the page never gains a horizontal axis, and nothing
 * moves while the reader is not moving it.
 *
 * The regression that motivated most of it: `gsap.quickSetter(el, 'scale')`
 * threw inside the hero's `onUpdate`, which aborted ScrollTrigger's own refresh
 * pass, which dropped the pin spacers of every scene below it — the last third
 * of the page became unreachable, and the only visible symptom was that
 * scrolling stopped.
 *
 * A full pass is expensive — Lenis has to settle at every stop — so the
 * properties that share one sweep are asserted from one sweep.
 */

const STEPS = 16;

test.describe('motion runtime', () => {
  test('a full pass keeps the page whole', async ({ page }) => {
    const viart = new ViartPage(page);
    await viart.collectLayoutShift();
    await viart.goto();

    const probes = await viart.sweep(STEPS);

    // --- nothing threw ------------------------------------------------------
    expect(viart.pageErrors, `page errors:\n${viart.pageErrors.join('\n')}`).toEqual([]);

    // --- the document keeps its length -------------------------------------
    // A collapsing pin spacer shows up here first, and it is the difference
    // between "the last chapters are reachable" and "the page stops scrolling".
    const heights = probes.map((probe) => probe.documentHeight);
    const shortest = Math.min(...heights);
    const tallest = Math.max(...heights);
    expect(
      tallest - shortest,
      `document height moved between ${shortest} and ${tallest} during the pass`,
    ).toBeLessThan(tallest * 0.02);

    // --- the page actually reaches its end ---------------------------------
    const last = probes[probes.length - 1];
    const viewport = page.viewportSize()!.height;
    expect(last.scrollY).toBeGreaterThan(last.documentHeight - viewport - 40);

    // --- no horizontal axis, at any point ----------------------------------
    for (const probe of probes) {
      expect(probe.overflowX, `overflow-x at y=${probe.scrollY}`).toBeLessThanOrEqual(1);
    }

    // --- every pinned scene held the viewport ------------------------------
    for (const selector of PINNED) {
      const parked = probes.filter((probe) => {
        const rect = probe.rects[selector];
        return rect !== null && Math.abs(rect[0]) <= 2;
      });
      expect(parked.length, `${selector} never held the viewport top`).toBeGreaterThan(0);
    }

    // --- media resolved ----------------------------------------------------
    expect(viart.brokenMedia, viart.brokenMedia.join('\n')).toEqual([]);
    const decodeFailures = await viart.decodeFailures();
    expect(decodeFailures, decodeFailures.join('\n')).toEqual([]);

    // --- motion did not shift the layout out from under the reader ---------
    const shift = await viart.layoutShift();
    expect(
      shift.shifted,
      `layout shift ${shift.shifted} (raw ${shift.raw}, pin swaps excluded)`,
    ).toBeLessThan(0.25);
  });

  test('the hero zoom actually writes a transform', async ({ page }) => {
    const viart = new ViartPage(page);
    await viart.goto();

    // The scene drives `scale` through a per-frame setter. The failure this
    // guards is silent in one direction and catastrophic in the other: resolved
    // through the wrong branch the setter either throws — taking ScrollTrigger's
    // refresh pass with it — or quietly writes an HTML attribute nobody reads,
    // and the wall simply never zooms.
    const readScale = () =>
      page.evaluate(() => {
        const read = (selector: string) => {
          const element = document.querySelector(selector);
          if (!element) return null;
          const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
          return Math.round(matrix.a * 1000) / 1000;
        };
        return { gallery: read('.hb-gallery'), focal: read('.hb-img--main img') };
      });

    const atTop = await readScale();
    await viart.scrollTo(Math.round(page.viewportSize()!.height * 1.2));
    const zoomed = await readScale();

    expect(atTop.gallery).not.toBeNull();
    expect(zoomed.gallery!).toBeGreaterThan(atTop.gallery! + 0.2);
    expect(zoomed.focal!).toBeLessThan(atTop.focal!);
    expect(viart.pageErrors, `page errors:\n${viart.pageErrors.join('\n')}`).toEqual([]);
  });

  test('the first pin swaps without dropping a frame', async ({ page }) => {
    const viart = new ViartPage(page);
    await viart.goto();

    const top = await page.evaluate(
      () => (document.querySelector('.cap-scene') as HTMLElement).getBoundingClientRect().top,
    );

    // Straddle the pin's start. Chrome scores the `position: fixed` swap as a
    // full-viewport layout shift because the section leaves the scrolling
    // contents; the only way to tell that apart from the section genuinely
    // blinking is to look at its box on every frame of the crossing.
    const frames = await framesAcross(page, '.cap-scene', Math.round(top) - 260, Math.round(top) + 320);

    expect(frames.length).toBeGreaterThan(20);
    const collapsed = frames.filter(([, , width, height]) => width === 0 || height === 0);
    expect(collapsed.length, `section had no box on ${collapsed.length} frames`).toBe(0);

    // And it never jumps: once parked at the viewport top it stays there.
    const parked = frames.filter(([, top]) => Math.abs(top) <= 2);
    expect(parked.length, 'section never parked at the viewport top').toBeGreaterThan(3);
  });

  test('nothing moves while the reader does not', async ({ page }) => {
    const viart = new ViartPage(page);
    await viart.goto();

    const height = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    );

    // Sampled inside the scenes rather than across the whole page: a scroll jump
    // is a pin re-measuring under a stationary reader, so it happens where the
    // pins are.
    for (const fraction of [0.1, 0.3, 0.5, 0.72, 0.9]) {
      await viart.scrollTo(Math.round(height * fraction));
      const drift = await idleDrift(page, 600);
      expect(drift, `page drifted ${drift}px at ${Math.round(fraction * 100)}%`).toBeLessThan(4);
    }

    expect(viart.pageErrors, `page errors:\n${viart.pageErrors.join('\n')}`).toEqual([]);
  });
});

test.describe('resize', () => {
  test('crossing the video rig breakpoint leaves the plate under script', async ({ page }) => {
    test.skip(page.viewportSize()!.width < 900, 'the rig is desktop-only');

    const viart = new ViartPage(page);
    await viart.goto();

    const before = await page.evaluate(() => document.documentElement.scrollHeight);

    // Below the gate the stylesheet drops the quarter-scale transform and the
    // rig is not built; above it, both come back. A gate read once at build time
    // gets this wrong in one direction and leaves the plate a sliver floating
    // over the section above.
    await page.setViewportSize({ width: 820, height: 900 });
    await page.waitForTimeout(1000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(1500);
    await settle(page);

    const after = await page.evaluate(() => {
      const container = document.querySelector('.grow-container') as HTMLElement | null;
      return {
        documentHeight: document.documentElement.scrollHeight,
        inlineTransform: container?.style.transform ?? '',
        overflowX:
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    // The scenes are rebuilt, so the pins are back and the page is its full
    // length again.
    expect(Math.abs(after.documentHeight - before)).toBeLessThan(before * 0.05);
    expect(after.overflowX).toBeLessThanOrEqual(1);
    // The rig writes the plate's transform itself. An empty inline transform
    // means only the stylesheet's `@media (min-width: 900px)` rule applied and
    // nothing is left to grow the plate back.
    expect(after.inlineTransform, 'the video rig was not rebuilt after the resize').toContain(
      'scale(',
    );
    expect(viart.pageErrors, `page errors:\n${viart.pageErrors.join('\n')}`).toEqual([]);
  });
});

test.describe('reduced motion', () => {
  test('collapses the scroll scaffolding and leaves the content readable', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    const viart = new ViartPage(page);
    await viart.goto();

    const state = await page.evaluate(() => {
      const hidden = Array.from(
        document.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-item]'),
      ).filter((element) => Number(getComputedStyle(element).opacity) < 0.9);
      return {
        hidden: hidden.length,
        // A pin spacer is the box ScrollTrigger inserts to hold a pinned
        // section's scroll. Under reduced motion no scene is built, so there is
        // nothing to pin and none of them may exist — and unlike a named
        // scaffolding selector, this cannot pass vacuously.
        pinSpacers: document.querySelectorAll('.pin-spacer').length,
        heroSpacer:
          document.querySelector('.hb-ws')?.getBoundingClientRect().height ?? -1,
      };
    });

    // No scene is built, so none of the boxes that exist only to hold scroll may
    // survive: the hero's spacer alone is two and a half screens of nothing.
    expect(state.pinSpacers, 'a pin spacer survived with no scene to pin').toBe(0);
    expect(state.heroSpacer, 'the hero scroll spacer did not collapse').toBe(0);
    expect(state.hidden, 'reveal targets left hidden with no animation to show them').toBe(0);
    expect(viart.pageErrors, `page errors:\n${viart.pageErrors.join('\n')}`).toEqual([]);
  });
});
