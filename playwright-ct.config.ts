/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
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
    ['html'],
    ['json', { outputFile: 'test-results/component-test-results.json' }]
  ],
  timeout: 60000, // 60 seconds for visual demo tests
  use: {
    trace: 'on-first-retry',
    ctPort: 3100,
    screenshot: 'always',
    video: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});