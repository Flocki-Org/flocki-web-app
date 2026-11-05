import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  oxc: {
    target: 'es2022',
  },
  build: {
    target: 'es2022',
  },
  test: {
    environment: 'jsdom',
  },
})
