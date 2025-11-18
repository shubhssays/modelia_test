/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    silent: false,
    onConsoleLog(log) {
      // Suppress expected React act() warnings from async operations
      if (log.includes('An update to') && log.includes('was not wrapped in act')) {
        return false;
      }
      return true;
    },
  },
})
