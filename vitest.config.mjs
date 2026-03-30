import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/mod/**/*.test.mjs', 'tests/plugins/**/*.test.mjs'],
    exclude: ['tests/lib/**', 'tests/browser/**', 'tests/_mapp.test.mjs'],
    setupFiles: ['tests/setup.mjs'],
    testTimeout: 10000,
    fileParallelism: false,
  },
});
