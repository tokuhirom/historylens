import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { resolve } from 'path'
import preact from '@preact/preset-vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        dashboard: resolve(__dirname, 'src/dashboard.tsx'),
        background: resolve(__dirname, 'src/background.ts'),
        options: resolve(__dirname, 'src/options.tsx')
      },
      output: {
        entryFileNames: '[name].js'
      }
    }
  },
  plugins: [
    preact(),
    viteStaticCopy({
      targets: [
        { src: 'src/dashboard.html', dest: '.' },
        { src: 'src/options.html', dest: '.' },
        { src: 'public/manifest.json', dest: '.' },
        { src: 'public/icons', dest: 'icons' }
      ]
    })
  ]
})