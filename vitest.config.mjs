import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: rootDir,
  test: {
    include: [
      './apps/xyz/tests/mapp/**/*.test.mjs',
      './apps/xyz/tests/mod/**/*.test.mjs',
      './apps/xyz/tests/plugins/**/*.test.mjs',
      './apps/xyz/tests/utils/**/*.test.mjs',
    ],
    exclude: [
      './apps/xyz/tests/lib/**',
      './apps/xyz/tests/browser/**',
      './apps/xyz/tests/_mapp.test.mjs',
    ],
    setupFiles: ['./apps/xyz/tests/setup.mjs'],
    testTimeout: 10000,
    fileParallelism: true,
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'lcov'],
    },
  },
});
