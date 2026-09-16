import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the accessibility (a11y) test suite.
 *
 * - `webServer` serves the static demo app from `public/` at http://localhost:4173
 *   (no build step required — files are served as-is).
 * - Only the Chromium project runs; axe-core scans run in Chromium.
 * - Reporters: `list` for the console output plus the built-in `html` report,
 *   written to `playwright-report/`.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  use: {
    baseURL: 'http://localhost:4173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'npx http-server public -p 4173 -c-1 --silent',
    url: 'http://localhost:4173/index.html',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  }
});