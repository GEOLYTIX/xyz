import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig({
  root: rootDir,
  test: {
    include: ['./tests/**/*.test.mjs'],
    testTimeout: 10000,
    fileParallelism: true,
    coverage: {
      provider: 'v8',
      exclude: ['tests/**'],
      // The lcov paths are relative to the repository root so that the
      // sonar.javascript.lcov.reportPaths in sonar-project.properties resolve.
      reporter: ['text', ['lcov', { projectRoot: repoRoot }]],
      reportsDirectory: './coverage',
    },
  },
});
