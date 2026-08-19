import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.VIART_E2E_PORT ?? 3111);
const baseURL = process.env.VIART_E2E_BASE_URL ?? `http://localhost:${PORT}`;

/**
 * Two representative viewports, no more: a 1440×900 desktop and a 390×844
 * phone. Everything this suite is built to catch is a motion-runtime problem —
 * a trigger that throws, a pin that collapses, a scene that keeps writing
 * layout — and those show up on one screen of each kind.
 *
 * `VIART_E2E_CHROMIUM` points at a preinstalled browser where the sandbox has
 * one; without it Playwright uses its own download.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 240_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    launchOptions: { executablePath: process.env.VIART_E2E_CHROMIUM || undefined },
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
