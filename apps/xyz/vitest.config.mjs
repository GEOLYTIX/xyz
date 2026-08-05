import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: rootDir,
  test: {
    include: ['./tests/mod/**/*.test.mjs', './tests/plugins/**/*.test.mjs'],
    exclude: ['./tests/lib/**', './tests/browser/**', './tests/_mapp.test.mjs'],
    setupFiles: ['./tests/setup.mjs'],
    testTimeout: 10000,
    fileParallelism: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
});
