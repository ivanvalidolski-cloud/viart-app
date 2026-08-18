import { expect, test } from '@playwright/test';
import { pinnedFor, WIDE_BREAKPOINT, ViartPage } from './pages/ViartPage';
import { framesAcross, idleDrift, settle, transformSettled, wheelBy } from './support/scroll';

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
    for (const selector of pinnedFor(page.viewportSize()!.width)) {
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

/**
 * The second half's pacing contract.
 *
 * Not how it looks — what has to be true of it: one signature moment and no
 * second one, four states whose picture and words are the same state at every
 * stop, and a release that hands the sequence to the document rather than
 * cutting it loose.
 */
test.describe('the second half', () => {
  test('pins once for the stage and once for the sequence, and never again', async ({ page }) => {
    const viart = new ViartPage(page);
    await viart.goto();

    const wide = page.viewportSize()!.width >= WIDE_BREAKPOINT;

    const pinned = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.pin-spacer'))
        .map((spacer) => (spacer.firstElementChild as HTMLElement | null)?.className ?? '')
        .map((name) => name.split(/\s+/)[0]),
    );

    // Everything below the studio is ordinary flow: the complexes, the reviews
    // and the closing panel may not reserve a screen of scroll between them.
    expect(pinned).not.toContain('deck-scene');
    expect(pinned).not.toContain('mosaic-scene');
    expect(pinned).not.toContain('grow-scene');
    expect(pinned.filter((name) => name === 'ev-stage')).toHaveLength(wide ? 1 : 0);
    expect(pinned.filter((name) => name === 'spot-scene')).toHaveLength(1);
  });

  test('the sequence never shows one state and describes another', async ({ page }) => {
    const viart = new ViartPage(page);
    await viart.goto();

    /**
     * Read the sequence at a spread of stops through its own pin, forwards and
     * then backwards: the frame nearest the middle of the stage and the line
     * that is legible have to be the same index every time, in both directions.
     *
     * "The middle" is the middle of the band the section actually shows — its
     * own content box, whose top padding is the strip the fixed header paints
     * over. That is read here from the computed padding, not from the scene, so
     * this is a restatement of the CSS rather than of the code under test.
     *
     * The pin's own extent comes back with every read. A late image decode fires
     * one more `ScrollTrigger.refresh`, which moves both the start and the
     * length — measured once up front, every stop after it lands somewhere else.
     */
    const readState = () =>
      page.evaluate(() => {
        const section = document.querySelector<HTMLElement>('.spot-scene');
        const spacer = section?.parentElement;
        if (!section || !spacer) return null;

        const styles = getComputedStyle(section);
        const paddingTop = parseFloat(styles.paddingTop) || 0;
        const paddingBottom = parseFloat(styles.paddingBottom) || 0;
        const box = section.getBoundingClientRect();
        const middle = box.top + paddingTop + (box.height - paddingTop - paddingBottom) / 2;

        const frames = Array.from(section.querySelectorAll<HTMLElement>('.spot-img'));
        const distances = frames.map((frame) => {
          const rect = frame.getBoundingClientRect();
          return Math.abs(rect.top + rect.height / 2 - middle);
        });
        const nearest = Math.min(...distances);
        const centred = distances.indexOf(nearest);
        const runnerUp = Math.min(...distances.filter((_, index) => index !== centred));

        const names = Array.from(section.querySelectorAll<HTMLElement>('.spot-name'));
        const opacities = names.map((name) => Number(getComputedStyle(name).opacity));
        const legible = opacities.indexOf(Math.max(...opacities));

        const pinStart = spacer.getBoundingClientRect().top + window.scrollY;
        const pinLength = spacer.getBoundingClientRect().height - box.height;

        return {
          centred,
          legible,
          middle,
          pinLength,
          // Exactly halfway between two frames, "which one is centred" is decided
          // by sub-pixel rounding, and the answer is not meaningful either way.
          tied: runnerUp - nearest < 16,
          progress: (window.scrollY - pinStart) / pinLength,
        };
      });

    const first = await readState();
    expect(first, 'the sequence is not in the document').not.toBeNull();

    const STEPS = 14;
    const step = Math.round(first!.pinLength / STEPS);

    // Walk the pin down and back up rather than jumping to fractions of it: the
    // scene is read at wherever the step actually landed, so nothing here
    // depends on hitting an exact scroll position.
    const walk = async (direction: 1 | -1) => {
      const seen: number[] = [];
      for (let index = 0; index <= STEPS + 4; index += 1) {
        await wheelBy(page, direction * step);
        await transformSettled(page, '.spot-images');

        const state = await readState();
        if (!state || state.progress < 0 || state.progress > 1) continue;

        // The band the frames are centred in has to be the one the reader sees:
        // the fixed header paints over the top of a pinned scene.
        expect(state.middle, 'the frames are centred under the header').toBeGreaterThan(64);
        if (!state.tied) {
          expect(
            state.centred,
            `${direction > 0 ? 'forward' : 'reverse'} at ${Math.round(state.progress * 100)}%: the centred frame is ${state.centred} and the legible line is ${state.legible}`,
          ).toBe(state.legible);
          seen.push(state.centred);
        }
      }
      return seen;
    };

    // Park just above the pin, then walk it in both directions. A scrub reaching
    // a position from above is a different frame of the same scene than one
    // reaching it from below, and both have to hold.
    //
    // The parking is corrected until it lands, not assumed: `wheelTo` seeks an
    // absolute position against a smooth scroller and can finish a few hundred
    // pixels off, which is enough to start the walk already inside the pin and
    // miss its first state.
    await viart.scrollTo(
      await page.evaluate(() => {
        const spacer = document.querySelector('.spot-scene')!.parentElement!;
        return Math.round(spacer.getBoundingClientRect().top + window.scrollY) - 400;
      }),
    );
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const here = await readState();
      if (!here) break;
      const delta = Math.round((-0.08 - here.progress) * here.pinLength);
      if (Math.abs(delta) < 40) break;
      await wheelBy(page, delta);
    }

    const down = await walk(1);
    const up = await walk(-1);
    const walked = [...down, ...up];

    expect(walked.length, 'the walk never landed inside the pin').toBeGreaterThan(8);

    // …and it actually walked the four states rather than sitting on one.
    const seen = new Set(walked);
    expect(
      seen.size,
      `the sequence showed ${seen.size} of its four states: ${walked.join(' ')}`,
    ).toBe(4);
    expect(viart.pageErrors, `page errors:\n${viart.pageErrors.join('\n')}`).toEqual([]);
  });
});

test.describe('the quiet end of the page', () => {
  test('the review changes direction with the control that changed it', async ({ page }) => {
    const viart = new ViartPage(page);
    await viart.goto();

    const review = page.locator('.active-review');
    await review.scrollIntoViewIfNeeded();

    const read = () =>
      page.evaluate(() => {
        const block = document.querySelector<HTMLElement>('.active-review')!;
        return {
          direction: block.dataset.reviewDir ?? '',
          animation: getComputedStyle(block).animationName,
          quote: block.querySelector('blockquote')?.textContent ?? '',
          name: block.querySelector('footer strong')?.textContent ?? '',
        };
      });

    const first = await read();

    await page.locator('.review-controls button[aria-label="Следующий отзыв"]').click();
    const next = await read();
    expect(next.direction).toBe('next');
    expect(next.animation).toBe('reviewSwapNext');
    expect(next.quote).not.toBe(first.quote);

    await page.locator('.review-controls button[aria-label="Предыдущий отзыв"]').click();
    const back = await read();
    expect(back.direction).toBe('prev');
    expect(back.animation).toBe('reviewSwapPrev');
    // One voice at a time, and the control returns to the one it came from.
    expect(back.quote).toBe(first.quote);
    expect(back.name).toBe(first.name);
    expect(await page.locator('.active-review').count()).toBe(1);

    // The award lockup is part of this chapter's proof and stays put.
    await expect(page.locator('.award-lockup')).toContainText('Хорошее место');
    expect(viart.pageErrors, `page errors:\n${viart.pageErrors.join('\n')}`).toEqual([]);
  });

  test('working the price filters leaves the scenes below it measured', async ({ page }) => {
    const viart = new ViartPage(page);
    await viart.goto();

    // The price list is keyed, so every filter change remounts it at a different
    // height and moves every pin below `#pricing` by hundreds of pixels. The
    // scenes have to be re-measured, repeatedly, and not just the first time.
    for (const label of ['Комплексы эпиляции', 'Аппаратный массаж', 'Лазерная эпиляция']) {
      await page.locator('.control-group--categories button', { hasText: label }).click();
      await page.waitForTimeout(600);
    }
    await page.locator('.segmented-control button', { hasText: 'Мужчины' }).click();
    await page.waitForTimeout(600);
    await page.locator('.segmented-control button', { hasText: 'Женщины' }).click();
    await page.waitForTimeout(900);

    // Walk into the sequence and check it still agrees with itself.
    const spacerTop = await page.evaluate(() => {
      const section = document.querySelector('.spot-scene')!;
      return Math.round(section.parentElement!.getBoundingClientRect().top + window.scrollY);
    });
    await viart.scrollTo(spacerTop + 200);
    await wheelBy(page, 400);
    await transformSettled(page, '.spot-images');

    const state = await page.evaluate(() => {
      const section = document.querySelector<HTMLElement>('.spot-scene')!;
      const styles = getComputedStyle(section);
      const paddingTop = parseFloat(styles.paddingTop) || 0;
      const paddingBottom = parseFloat(styles.paddingBottom) || 0;
      const box = section.getBoundingClientRect();
      const middle = box.top + paddingTop + (box.height - paddingTop - paddingBottom) / 2;
      const frames = Array.from(section.querySelectorAll<HTMLElement>('.spot-img'));
      const distances = frames.map((frame) => {
        const rect = frame.getBoundingClientRect();
        return Math.abs(rect.top + rect.height / 2 - middle);
      });
      const opacities = Array.from(section.querySelectorAll<HTMLElement>('.spot-name')).map(
        (name) => Number(getComputedStyle(name).opacity),
      );
      return {
        centred: distances.indexOf(Math.min(...distances)),
        legible: opacities.indexOf(Math.max(...opacities)),
        pinned: Math.round(box.top),
        overflowX:
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    expect(state.pinned, 'the sequence did not hold the viewport after a refresh').toBeLessThanOrEqual(2);
    expect(state.centred, 'the sequence lost sync after the price list changed height').toBe(
      state.legible,
    );
    expect(state.overflowX).toBeLessThanOrEqual(1);
    expect(viart.pageErrors, `page errors:\n${viart.pageErrors.join('\n')}`).toEqual([]);
  });
});

test.describe('resize', () => {
  test('crossing the stage breakpoint rebuilds the pin it owns', async ({ page }) => {
    test.skip(page.viewportSize()!.width < WIDE_BREAKPOINT, 'the pinned stage is desktop-only');

    const viart = new ViartPage(page);
    await viart.goto();

    const before = await page.evaluate(() => document.documentElement.scrollHeight);

    // The EVERLAS stage is pinned above 900px and is an ordinary block below it,
    // in the stylesheet and in the driver alike. A gate read once at build time
    // gets this wrong in one direction and leaves either a pin with no scene or
    // a scene with nowhere to hold.
    await page.setViewportSize({ width: 820, height: 900 });
    await page.waitForTimeout(1000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(1500);
    await settle(page);

    const after = await page.evaluate(() => {
      const stage = document.querySelector('.ev-stage');
      return {
        documentHeight: document.documentElement.scrollHeight,
        // ScrollTrigger wraps a pinned element in a spacer of its own. If the
        // scene was not rebuilt there is no wrapper and nothing holds the pin.
        stagePinned: stage?.parentElement?.classList.contains('pin-spacer') ?? false,
        overflowX:
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    // The scenes are rebuilt, so the pins are back and the page is its full
    // length again.
    expect(Math.abs(after.documentHeight - before)).toBeLessThan(before * 0.05);
    expect(after.overflowX).toBeLessThanOrEqual(1);
    expect(after.stagePinned, 'the EVERLAS stage was not rebuilt after the resize').toBe(true);
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
        // A composition that leans on a scene's clip for its bleed gains a
        // horizontal axis for the whole page the moment the clip is relaxed.
        overflowX:
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
        // Every state of the sequence is a plain list item here, not a slot.
        namesVisible: Array.from(
          document.querySelectorAll<HTMLElement>('.spot-name'),
        ).filter((name) => Number(getComputedStyle(name).opacity) > 0.9).length,
      };
    });

    expect(state.overflowX, 'the page gained a horizontal axis').toBeLessThanOrEqual(1);
    expect(state.namesVisible, 'the four procedure states are not all readable').toBe(4);

    // No scene is built, so none of the boxes that exist only to hold scroll may
    // survive: the hero's spacer alone is two and a half screens of nothing.
    expect(state.pinSpacers, 'a pin spacer survived with no scene to pin').toBe(0);
    expect(state.heroSpacer, 'the hero scroll spacer did not collapse').toBe(0);
    expect(state.hidden, 'reveal targets left hidden with no animation to show them').toBe(0);
    expect(viart.pageErrors, `page errors:\n${viart.pageErrors.join('\n')}`).toEqual([]);
  });
});
