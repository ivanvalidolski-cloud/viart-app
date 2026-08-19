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
    test.skip(
      page.viewportSize()!.width < WIDE_BREAKPOINT,
      'the second half is stacked flow below the breakpoint — there is no pin to swap',
    );

    const viart = new ViartPage(page);
    await viart.goto();

    const top = await page.evaluate(
      () => (document.querySelector('.laser-stage') as HTMLElement).getBoundingClientRect().top,
    );

    // Straddle the pin's start. Chrome scores the `position: fixed` swap as a
    // full-viewport layout shift because the section leaves the scrolling
    // contents; the only way to tell that apart from the section genuinely
    // blinking is to look at its box on every frame of the crossing.
    const frames = await framesAcross(page, '.laser-stage', Math.round(top) - 260, Math.round(top) + 320);

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
 * Not how it looks — what has to be true of it: two short sticky viewports and
 * no third one, and, in both of them, a picture and a caption that are the same
 * state at every stop of the scrub and in both directions.
 */

/** The two sticky viewports of the second half, and how to read each one. */
const STICKY = [
  {
    name: 'the laser chapter',
    section: '.laser-scene',
    stage: '.laser-stage',
    media: '.laser-frame',
    copy: '.laser-copy',
    states: 3,
  },
  {
    name: 'the procedure slides',
    section: '.slide-scene',
    stage: '.slide-stage',
    media: '.slide-frame',
    copy: '.slide-caption',
    states: 3,
  },
] as const;

test.describe('the second half', () => {
  test('holds the reader twice, briefly, and never again', async ({ page }) => {
    const viart = new ViartPage(page);
    await viart.goto();

    const wide = page.viewportSize()!.width >= WIDE_BREAKPOINT;

    const pinned = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.pin-spacer'))
        .map((spacer) => (spacer.firstElementChild as HTMLElement | null)?.className ?? '')
        .map((name) => name.split(/\s+/)[0]),
    );

    // The equipment scenes, the studio gallery, the video wall, the complexes
    // and everything under them are ordinary flow: none of them may reserve a
    // screen of scroll.
    for (const name of ['rig-chapter', 'studio-chapter', 'reel-chapter', 'deck-scene']) {
      expect(pinned, `${name} reserved scroll`).not.toContain(name);
    }
    expect(pinned.filter((name) => name === 'laser-stage')).toHaveLength(wide ? 1 : 0);
    expect(pinned.filter((name) => name === 'slide-stage')).toHaveLength(wide ? 1 : 0);
    expect(viart.pageErrors, `page errors:\n${viart.pageErrors.join('\n')}`).toEqual([]);
  });

  test('costs the scroll it says it costs', async ({ page }) => {
    test.skip(page.viewportSize()!.width < WIDE_BREAKPOINT, 'no sticky viewport below the breakpoint');

    const viart = new ViartPage(page);
    await viart.goto();

    // A sticky viewport is one screen of stage plus its own pin distance. The
    // budgets are 0.9 and 1.1 viewports, so the two blocks cost ~1.9 and ~2.1
    // screens — the ceiling below is what "noticeably shorter than the
    // baseline" means in numbers: the pair used to cost nine.
    for (const scene of STICKY) {
      const cost = await page.evaluate((selector) => {
        const stage = document.querySelector<HTMLElement>(selector)!;
        const spacer = stage.parentElement!;
        return spacer.getBoundingClientRect().height / window.innerHeight;
      }, scene.stage);
      expect(cost, `${scene.name} costs ${cost.toFixed(2)} viewports`).toBeLessThan(2.35);
      expect(cost, `${scene.name} costs ${cost.toFixed(2)} viewports`).toBeGreaterThan(1.6);
    }
  });

  for (const scene of STICKY) {
    test(`${scene.name} never shows one state and describes another`, async ({ page }) => {
      test.skip(
        page.viewportSize()!.width < WIDE_BREAKPOINT,
        'stacked flow below the breakpoint: every state is present at once',
      );

      const viart = new ViartPage(page);
      await viart.goto();

      /**
       * Read the scene at a spread of stops through its own pin, forwards and
       * then backwards.
       *
       * The property under test is the one the whole rewrite turns on: a state
       * is one thing. Its picture and its copy are driven off a single derived
       * position, so the most present picture and the most present copy have to
       * be the same index at every stop, in both directions — and never, at any
       * stop, may the slot be empty.
       *
       * The pin's own extent comes back with every read: a late image decode
       * fires one more `ScrollTrigger.refresh`, which moves both the start and
       * the length.
       */
      const readState = () =>
        page.evaluate((selectors) => {
          const stage = document.querySelector<HTMLElement>(selectors.stage);
          const spacer = stage?.parentElement;
          if (!stage || !spacer) return null;

          const presence = (selector: string) =>
            Array.from(document.querySelectorAll<HTMLElement>(selector)).map((element) =>
              Number(getComputedStyle(element).opacity),
            );

          const media = presence(selectors.media);
          const copy = presence(selectors.copy);
          const strongest = (values: number[]) => values.indexOf(Math.max(...values));

          const pinStart = spacer.getBoundingClientRect().top + window.scrollY;
          const pinLength = spacer.getBoundingClientRect().height - stage.offsetHeight;

          return {
            media,
            copy,
            mediaIndex: strongest(media),
            copyIndex: strongest(copy),
            // The exchange is built to sum to 1, so the total presence is a
            // direct read of "the slot is never empty".
            mediaTotal: media.reduce((sum, value) => sum + value, 0),
            pinLength,
            progress: (window.scrollY - pinStart) / pinLength,
          };
        }, { stage: scene.stage, media: scene.media, copy: scene.copy });

      const first = await readState();
      expect(first, `${scene.name} is not in the document`).not.toBeNull();
      expect(first!.media).toHaveLength(scene.states);
      expect(first!.copy).toHaveLength(scene.states);

      const STOPS = 12;
      const step = Math.round(first!.pinLength / STOPS);

      const walk = async (direction: 1 | -1) => {
        const seen: number[] = [];
        for (let index = 0; index <= STOPS + 4; index += 1) {
          await wheelBy(page, direction * step);
          await transformSettled(page, scene.copy);

          const state = await readState();
          if (!state || state.progress < 0 || state.progress > 1) continue;

          expect(
            state.copyIndex,
            `${direction > 0 ? 'forward' : 'reverse'} at ${Math.round(state.progress * 100)}%: ` +
              `the picture is ${state.mediaIndex} and the copy is ${state.copyIndex}`,
          ).toBe(state.mediaIndex);

          // …and the picture and its copy are equally present, not merely
          // ranked the same. A 0.05 tolerance is sub-pixel rounding of two
          // separately composited opacities.
          expect(
            Math.abs(state.media[state.mediaIndex] - state.copy[state.copyIndex]),
            `picture and copy are ${state.media[state.mediaIndex]} and ${state.copy[state.copyIndex]}`,
          ).toBeLessThan(0.05);

          expect(
            state.mediaTotal,
            `the media slot was ${state.mediaTotal.toFixed(2)} present at ` +
              `${Math.round(state.progress * 100)}%`,
          ).toBeGreaterThan(0.9);

          seen.push(state.mediaIndex);
        }
        return seen;
      };

      // Park just above the pin, correcting until it lands: `wheelTo` seeks an
      // absolute position against a smooth scroller and can finish a few hundred
      // pixels off, which is enough to start the walk already inside the pin.
      await viart.scrollTo(
        await page.evaluate((selector) => {
          const spacer = document.querySelector(selector)!.parentElement!;
          return Math.round(spacer.getBoundingClientRect().top + window.scrollY) - 400;
        }, scene.stage),
      );
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const here = await readState();
        if (!here) break;
        const delta = Math.round((-0.08 - here.progress) * here.pinLength);
        if (Math.abs(delta) < 40) break;
        await wheelBy(page, delta);
      }

      const walked = [...(await walk(1)), ...(await walk(-1))];
      expect(walked.length, 'the walk never landed inside the pin').toBeGreaterThan(8);

      // …and it actually walked every state rather than sitting on one.
      expect(
        new Set(walked).size,
        `${scene.name} showed ${new Set(walked).size} of its ${scene.states} states`,
      ).toBe(scene.states);
      expect(viart.pageErrors, `page errors:\n${viart.pageErrors.join('\n')}`).toEqual([]);
    });
  }
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

    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflowX).toBeLessThanOrEqual(1);

    if (page.viewportSize()!.width < WIDE_BREAKPOINT) {
      // Below the breakpoint there is nothing pinned under the price list to
      // lose its measurement; the overflow check above still applies.
      expect(viart.pageErrors, `page errors:\n${viart.pageErrors.join('\n')}`).toEqual([]);
      return;
    }

    // Walk into the slides and check they still agree with themselves.
    const spacerTop = await page.evaluate(() => {
      const stage = document.querySelector('.slide-stage')!;
      return Math.round(stage.parentElement!.getBoundingClientRect().top + window.scrollY);
    });
    await viart.scrollTo(spacerTop + 200);
    await wheelBy(page, 400);
    await transformSettled(page, '.slide-caption');

    const state = await page.evaluate(() => {
      const stage = document.querySelector<HTMLElement>('.slide-stage')!;
      const presence = (selector: string) =>
        Array.from(document.querySelectorAll<HTMLElement>(selector)).map((element) =>
          Number(getComputedStyle(element).opacity),
        );
      const media = presence('.slide-frame');
      const copy = presence('.slide-caption');
      return {
        mediaIndex: media.indexOf(Math.max(...media)),
        copyIndex: copy.indexOf(Math.max(...copy)),
        pinned: Math.round(stage.getBoundingClientRect().top),
      };
    });

    expect(state.pinned, 'the slides did not hold the viewport after a refresh').toBeLessThanOrEqual(2);
    expect(state.mediaIndex, 'the slides lost sync after the price list changed height').toBe(
      state.copyIndex,
    );
    expect(viart.pageErrors, `page errors:\n${viart.pageErrors.join('\n')}`).toEqual([]);
  });
});

test.describe('resize', () => {
  test('crossing the breakpoint rebuilds the pins it owns', async ({ page }) => {
    test.skip(page.viewportSize()!.width < WIDE_BREAKPOINT, 'the sticky viewports are desktop-only');

    const viart = new ViartPage(page);
    await viart.goto();

    const before = await page.evaluate(() => document.documentElement.scrollHeight);

    // Both sticky viewports are pinned above 900px and are ordinary stacked
    // blocks below it, in the stylesheet and in the driver alike. A gate read
    // once at build time gets this wrong in one direction and leaves either a
    // pin with no scene or a scene with nowhere to hold.
    await page.setViewportSize({ width: 820, height: 900 });
    await page.waitForTimeout(1000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(1500);
    await settle(page);

    const after = await page.evaluate(() => {
      const pinned = (selector: string) =>
        document.querySelector(selector)?.parentElement?.classList.contains('pin-spacer') ?? false;
      return {
        documentHeight: document.documentElement.scrollHeight,
        // ScrollTrigger wraps a pinned element in a spacer of its own. If the
        // scene was not rebuilt there is no wrapper and nothing holds the pin.
        stagePinned: pinned('.laser-stage') && pinned('.slide-stage'),
        overflowX:
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    // The scenes are rebuilt, so the pins are back and the page is its full
    // length again.
    expect(Math.abs(after.documentHeight - before)).toBeLessThan(before * 0.05);
    expect(after.overflowX).toBeLessThanOrEqual(1);
    expect(after.stagePinned, 'a sticky viewport was not rebuilt after the resize').toBe(true);
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
        // Every state of both sticky viewports is a plain block here, not a
        // slot: all three pictures and all three copies are readable at once.
        statesVisible: ['.laser-frame', '.laser-copy', '.slide-frame', '.slide-caption'].map(
          (selector) =>
            Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(
              (element) => Number(getComputedStyle(element).opacity) > 0.9,
            ).length,
        ),
        // The gallery is a scroller, not a scene: every control it has stays.
        galleryControls: document.querySelectorAll('.shot-buttons button').length,
        galleryCards: document.querySelectorAll('.shot-card').length,
        // …and so does every video's own play control.
        videoControls: document.querySelectorAll('.reel-play').length,
      };
    });

    expect(state.overflowX, 'the page gained a horizontal axis').toBeLessThanOrEqual(1);
    expect(state.statesVisible, 'a state of the second half is not readable').toEqual([3, 3, 3, 3]);
    expect(state.galleryControls, 'the gallery lost its controls').toBe(2);
    expect(state.galleryCards, 'the gallery lost its frames').toBeGreaterThan(3);
    expect(state.videoControls, 'a video lost its play control').toBeGreaterThan(0);

    // No scene is built, so none of the boxes that exist only to hold scroll may
    // survive: the hero's spacer alone is two and a half screens of nothing.
    expect(state.pinSpacers, 'a pin spacer survived with no scene to pin').toBe(0);
    expect(state.heroSpacer, 'the hero scroll spacer did not collapse').toBe(0);
    expect(state.hidden, 'reveal targets left hidden with no animation to show them').toBe(0);
    expect(viart.pageErrors, `page errors:\n${viart.pageErrors.join('\n')}`).toEqual([]);
  });
});

/**
 * The two blocks of the second half that are read with the hands rather than
 * with the scrollbar.
 */
test.describe('the studio gallery', () => {
  test('moves on its controls, without a hover anywhere', async ({ page }) => {
    const viart = new ViartPage(page);
    await viart.goto();

    const gallery = page.locator('.shot-gallery');
    await gallery.scrollIntoViewIfNeeded();

    const read = () =>
      page.evaluate(() => {
        const track = document.querySelector<HTMLElement>('.shot-track')!;
        const active = document.querySelector<HTMLElement>('.shot-card.is-active');
        return {
          left: Math.round(track.scrollLeft),
          // The whole row lives inside the track's own overflow — the document
          // may never gain an axis because of it.
          overflowX:
            document.documentElement.scrollWidth - document.documentElement.clientWidth,
          activeIndex: active
            ? Array.from(track.children).indexOf(active)
            : -1,
          // Every frame carries its own index and caption, so nothing here is
          // only reachable by pointing at it.
          captions: document.querySelectorAll('.shot-card .shot-text').length,
          indices: document.querySelectorAll('.shot-card .shot-index').length,
          cards: track.children.length,
        };
      });

    const first = await read();
    expect(first.activeIndex, 'no frame is active on arrival').toBe(0);
    expect(first.captions, 'a frame has no caption').toBe(first.cards);
    expect(first.indices, 'a frame has no index').toBe(first.cards);
    expect(first.overflowX).toBeLessThanOrEqual(1);

    // Forward on the control, and the position actually moved.
    await page.locator('.shot-buttons button[aria-label="Следующий кадр"]').click();
    await page.waitForTimeout(700);
    const next = await read();
    expect(next.left, 'the next control did not move the track').toBeGreaterThan(first.left);
    expect(next.activeIndex).toBe(1);

    // …and back, to the position it came from.
    await page.locator('.shot-buttons button[aria-label="Предыдущий кадр"]').click();
    await page.waitForTimeout(700);
    const back = await read();
    expect(back.activeIndex).toBe(0);
    expect(Math.abs(back.left - first.left)).toBeLessThan(8);

    // The first control is unusable at the first frame and the last at the last
    // — the row has ends, and they are stated rather than silently absorbed.
    await expect(
      page.locator('.shot-buttons button[aria-label="Предыдущий кадр"]'),
    ).toBeDisabled();

    // Keyboard reaches the same position as the buttons.
    await page.locator('.shot-track').focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(700);
    expect((await read()).activeIndex, 'the arrow keys do not move the track').toBe(1);

    expect(viart.pageErrors, `page errors:\n${viart.pageErrors.join('\n')}`).toEqual([]);
  });
});

test.describe('the video wall', () => {
  test('is portrait, equal and pressed rather than scrolled into', async ({ page }) => {
    const viart = new ViartPage(page);
    await viart.goto();

    const wall = page.locator('.reel-wall');
    await wall.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    const state = await page.evaluate(() => {
      const frames = Array.from(document.querySelectorAll<HTMLElement>('.reel-frame'));
      const visible = frames.filter((frame) => frame.getBoundingClientRect().width > 0);
      return {
        // A 9:16 frame around a 1080×1920 file has nothing to crop; anything
        // wider than tall is the failure this guards.
        ratios: visible.map((frame) => {
          const box = frame.getBoundingClientRect();
          return Math.round((box.width / box.height) * 100) / 100;
        }),
        // Equal priority is a measurement: one row, one width.
        widths: visible.map((frame) => Math.round(frame.getBoundingClientRect().width)),
        // Nothing is playing, and nothing started playing on the way here.
        playing: Array.from(document.querySelectorAll('video')).filter(
          (video) => !video.paused,
        ).length,
        // `preload="none"` — the scroll may not pull tens of megabytes.
        preloads: Array.from(document.querySelectorAll('video')).map((video) => video.preload),
        controls: document.querySelectorAll('.reel-play').length,
      };
    });

    expect(state.ratios.length, 'no video frame is on screen').toBeGreaterThan(0);
    for (const ratio of state.ratios) {
      expect(ratio, `a video frame is ${ratio}:1 — not portrait`).toBeCloseTo(9 / 16, 1);
    }
    expect(new Set(state.widths).size, 'the visible clips are not the same size').toBe(1);
    expect(state.playing, 'the scroll started a video').toBe(0);
    expect(new Set(state.preloads)).toEqual(new Set(['none']));
    expect(state.controls, 'a clip has no play control').toBeGreaterThan(0);

    // Pressing play is what starts it — and scrolling away does not stop it.
    await page.locator('.reel-play').first().click();
    await page.waitForTimeout(1500);
    expect(
      await page.evaluate(() =>
        Array.from(document.querySelectorAll('video')).some((video) => !video.paused),
      ),
      'the play control did not start the clip',
    ).toBe(true);
  });
});
