import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist_harness_bundles',
    emptyOutDir: false,
    lib: {
      entry: 'src/components/__tests__/ExpandedDebugConsoleTestHarness.hydrate.tsx',
      name: 'ExpandedDebugConsoleTestHarness',
      fileName: 'ExpandedDebugConsoleTestHarness.hydrate',
      formats: ['umd']
    }
  }
})