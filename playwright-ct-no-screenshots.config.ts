/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 * 
 * Component test config without screenshots for performance benchmarking
 */

import { defineConfig, devices } from '@playwright/experimental-ct-react';

export default defineConfig({
  testDir: './src/components/__tests__',
  testMatch: '**/*.ct.test.{ts,tsx}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['json', { outputFile: 'test-results/component-test-results-no-screenshots.json' }]
  ],
  timeout: 60000,
  use: {
    trace: 'retain-on-failure', // Only trace on failure
    ctPort: 3100,
    screenshot: 'off', // No screenshots
    video: 'off',      // No videos
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});