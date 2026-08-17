import type { Page } from '@playwright/test';

/**
 * Lenis owns the scroll position, so a direct `window.scrollTo` desynchronises
 * its internal target and the page snaps back. Every helper here drives the
 * page the way a visitor does — real wheel events — and then waits for the
 * smoothing to settle before anything is measured.
 */

export async function settle(page: Page, quietFrames = 5) {
  await page.evaluate(
    ([frames]) =>
      new Promise<void>((resolve) => {
        let last = window.scrollY;
        let quiet = 0;
        const tick = () => {
          const now = window.scrollY;
          quiet = Math.abs(now - last) < 0.5 ? quiet + 1 : 0;
          last = now;
          if (quiet >= frames) resolve();
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    [quietFrames],
  );
}

export async function wheelTo(page: Page, target: number, maxSteps = 120) {
  for (let step = 0; step < maxSteps; step += 1) {
    const current = await page.evaluate(() => window.scrollY);
    const delta = target - current;
    if (Math.abs(delta) < 8) break;
    await page.mouse.wheel(0, Math.max(-1600, Math.min(1600, delta)));
    await page.waitForTimeout(16);
  }
  await settle(page);
}

/**
 * Watch every animation frame while the page crosses a scroll position and
 * report the geometry of `selector` on each one. A pin swap is a one-frame
 * event; sampling after the fact cannot see it.
 */
export async function framesAcross(
  page: Page,
  selector: string,
  from: number,
  to: number,
) {
  await wheelTo(page, from);
  await page.evaluate((target) => {
    const store = window as unknown as { __viartFrames: number[][] };
    store.__viartFrames = [];
    const element = document.querySelector(target);
    if (!element) return;
    const tick = () => {
      const rect = element.getBoundingClientRect();
      store.__viartFrames.push([
        Math.round(window.scrollY),
        Math.round(rect.top),
        Math.round(rect.width),
        Math.round(rect.height),
      ]);
      if (store.__viartFrames.length < 1200) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, selector);

  const distance = to - from;
  const steps = 24;
  for (let index = 0; index < steps; index += 1) {
    await page.mouse.wheel(0, Math.round(distance / steps));
    await page.waitForTimeout(70);
  }
  await settle(page);

  return page.evaluate(
    () => (window as unknown as { __viartFrames: number[][] }).__viartFrames ?? [],
  );
}

export async function pageMetrics(page: Page) {
  return page.evaluate(() => ({
    scrollY: window.scrollY,
    scrollHeight: document.documentElement.scrollHeight,
    innerHeight: window.innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));
}

/** Sample the scroll position with no input at all — anything that moves is a jump. */
export async function idleDrift(page: Page, ms = 700) {
  return page.evaluate(
    ([duration]) =>
      new Promise<number>((resolve) => {
        const start = window.scrollY;
        let worst = 0;
        const began = performance.now();
        const tick = () => {
          worst = Math.max(worst, Math.abs(window.scrollY - start));
          if (performance.now() - began < duration) requestAnimationFrame(tick);
          else resolve(worst);
        };
        requestAnimationFrame(tick);
      }),
    [ms],
  );
}
