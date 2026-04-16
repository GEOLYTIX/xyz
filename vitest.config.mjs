import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'apps/xyz/tests/mod/**/*.test.mjs',
      'apps/xyz/tests/plugins/**/*.test.mjs',
    ],
    exclude: [
      'apps/xyz/tests/lib/**',
      'apps/xyz/tests/browser/**',
      'apps/xyz/tests/_mapp.test.mjs',
    ],
    setupFiles: ['apps/xyz/tests/setup.mjs'],
    testTimeout: 10000,
    fileParallelism: true,
    coverage: {
      provider: 'v8',
    },
  },
});
