/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses (0.0.0.0)
    port: 5173,
    watch: {
      usePolling: true, // Enable polling for file changes in Docker
    },
  },
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
