import type { Page } from '@playwright/test';
import { settle, wheelTo } from '../support/scroll';

/** The pinned or scrubbed scenes, in document order. */
export const SCENES = [
  '.hb-scene',
  '.cap-scene',
  '.spot-scene',
  '.dissolve-scene',
  '.mosaic-scene',
  '.grow-scene',
  '.deck-scene',
  '.wipe-story',
] as const;

/** The four boxes ScrollTrigger pins, and how long each stays fixed. */
export const PINNED = ['.cap-scene', '.spot-scene', '.deck-scene'] as const;

export type Probe = {
  scrollY: number;
  documentHeight: number;
  overflowX: number;
  rects: Record<string, [number, number, number, number] | null>;
};

export class ViartPage {
  readonly pageErrors: string[] = [];
  readonly brokenMedia: string[] = [];

  constructor(readonly page: Page) {
    page.on('pageerror', (error) => this.pageErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') this.pageErrors.push(message.text());
    });
    page.on('response', (response) => {
      const type = response.request().resourceType();
      if (response.status() >= 400 && (type === 'image' || type === 'media')) {
        this.brokenMedia.push(`${response.url()} → HTTP ${response.status()}`);
      }
    });
  }

  /**
   * Layout shift, in two figures.
   *
   * `raw` is what the browser reports. On a page with four pinned sections that
   * number is meaningless: the moment ScrollTrigger swaps a section to
   * `position: fixed` it leaves the scrolling contents, and Chrome accounts for
   * that as an element with no previous box appearing at full viewport size — a
   * clean 1.0 per pin and per unpin, for a section that provably does not move
   * (see the pin-swap test, which watches every frame of the swap).
   *
   * `shifted` drops exactly those: a source whose previous rect had no area did
   * not shift, it appeared. Anything that really moved — content pushed by a
   * box that changed size — still has a previous rect, and still counts.
   */
  async collectLayoutShift() {
    await this.page.addInitScript(() => {
      const store = window as unknown as { __viartCls: { raw: number; shifted: number } };
      store.__viartCls = { raw: 0, shifted: 0 };
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & {
            value: number;
            hadRecentInput: boolean;
            sources?: Array<{ previousRect: DOMRectReadOnly }>;
          };
          if (shift.hadRecentInput) continue;
          store.__viartCls.raw += shift.value;
          const sources = shift.sources ?? [];
          const appeared =
            sources.length > 0 &&
            sources.every(
              (source) => source.previousRect.width === 0 || source.previousRect.height === 0,
            );
          if (!appeared) store.__viartCls.shifted += shift.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
  }

  async goto() {
    await this.page.goto('/', { waitUntil: 'load' });
    // The motion layer is built behind `document.fonts.ready`, and the pins it
    // creates are what every measurement below depends on.
    await this.page.evaluate(() => document.fonts.ready);
    await this.page.waitForTimeout(1200);
    await settle(this.page);
  }

  async scrollTo(y: number) {
    await wheelTo(this.page, y);
  }

  async probe(): Promise<Probe> {
    return this.page.evaluate((selectors) => {
      const rects: Record<string, [number, number, number, number] | null> = {};
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (!element) {
          rects[selector] = null;
          continue;
        }
        const rect = element.getBoundingClientRect();
        rects[selector] = [
          Math.round(rect.top),
          Math.round(rect.left),
          Math.round(rect.width),
          Math.round(rect.height),
        ];
      }
      return {
        scrollY: Math.round(window.scrollY),
        documentHeight: document.documentElement.scrollHeight,
        overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        rects,
      };
    }, SCENES as unknown as string[]);
  }

  /** Walk the whole page in `steps` stops and return a probe at each one. */
  async sweep(steps: number): Promise<Probe[]> {
    const height = await this.page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    );
    const probes: Probe[] = [];
    for (let index = 0; index <= steps; index += 1) {
      await this.scrollTo(Math.round((height * index) / steps));
      probes.push(await this.probe());
    }
    return probes;
  }

  async layoutShift() {
    return this.page.evaluate(
      () =>
        (window as unknown as { __viartCls: { raw: number; shifted: number } }).__viartCls ?? {
          raw: 0,
          shifted: 0,
        },
    );
  }

  /** Images the browser fetched but could not decode. */
  async decodeFailures() {
    return this.page.evaluate(() =>
      Array.from(document.images)
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src),
    );
  }
}
