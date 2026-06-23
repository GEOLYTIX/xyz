import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: rootDir,
  test: {
    include: ['./tests/**/*.test.mjs'],
    testTimeout: 10000,
    fileParallelism: true,
  },
});
