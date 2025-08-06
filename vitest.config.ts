import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'bin/',
        '*.config.ts',
        'build.js',
        'test/**'
      ]
    },
    testTimeout: 10000,
    hookTimeout: 10000
  }
});