import { defineConfig, devices } from '@playwright/test'

/**
 * Runs against an already-running site: `docker compose -f deploy/compose.yml up`
 * locally (port 8080), the API started by CI, or a deployed URL via E2E_BASE_URL.
 */
export default defineConfig({
  testDir: './specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:8080',
    trace: 'retain-on-failure',
  },
  // C7 browser floor: desktop engines plus mobile Safari and Chrome, at the 320px shopper minimum.
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-webkit', use: { ...devices['iPhone 13'], viewport: { width: 320, height: 640 } } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'], viewport: { width: 320, height: 640 } } },
  ],
})
