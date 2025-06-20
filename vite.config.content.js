import { defineConfig } from 'vite'
import { resolve } from 'path'

// Separate config for content script to bundle it properly
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/content.ts'),
      formats: ['iife'],
      name: 'DailyTraceContent',
      fileName: () => 'content.js'
    },
    rollupOptions: {
      output: {
        extend: true,
        inlineDynamicImports: true
      }
    }
  }
})