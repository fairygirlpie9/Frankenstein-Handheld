import { defineConfig } from 'vitest/config';

export default defineConfig({
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  build: {
    target: 'esnext',
    outDir: 'dist'
  },
  server: {
    port: 3000,
    open: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts']
  }
});
