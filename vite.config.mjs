/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import replace from '@rollup/plugin-replace';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

// Match CRA's environment variables.
// TODO: Replace these with VITE_ prefixed environment variables, and using import.meta.env.VITE_* instead of process.env.REACT_APP_*.
const craEnvVarRegex = /^REACT_APP/i;
const craEnvVars = Object.keys(process.env)
  .filter((key) => craEnvVarRegex.test(key))
  .reduce((env, key) => {
    env[`process.env.${key}`] = JSON.stringify(process.env[key]);
    return env;
  }, {});

// https://vitejs.dev/config/
export default defineConfig({
  base: '/car-doppler/',
  build: {
    outDir: './dist/react-app'
  },
  server: {
    port: 3000,
    host: true,
    strictPort: true, // Fail if port 3000 is busy rather than auto-increment
    fs: {
      // Allow serving files from the car-speed-via-doppler-analysis directory
      allow: ['..']
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'src/setupTests.ts',
    css: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/*.ct.test.{ts,tsx}',
      '**/playwright-report/**',
      '**/test-results/**'
    ],
  },
  plugins: [
    react(),
    replace({ values: craEnvVars, preventAssignment: true }),
    nxViteTsPaths(),
  ],
});
