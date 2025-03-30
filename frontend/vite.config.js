import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  define: {
    // Prevent duplicate Buffer declarations
    Buffer: undefined,
    global: 'window',
    process: {
      env: {},
      version: '',
    }
  },
  resolve: {
    alias: {
      // Direct buffer to browser implementation
      buffer: 'buffer/',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
});