import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: rootDir,
  test: {
    include: [
      './tests/mod/**/*.test.mjs',
      './tests/plugins/**/*.test.mjs',
      './tests/utils/**/*.test.mjs',
    ],
    exclude: ['./tests/lib/**', './tests/browser/**', './tests/_mapp.test.mjs'],
    setupFiles: ['./tests/setup.mjs'],
    testTimeout: 10000,
    fileParallelism: true,
    coverage: {
      provider: 'v8',
      // The lcov.info is for SonarQube. The VS Code extension shows the coverage in the editor.
      reporter: ['text', 'lcovonly'],
      // Write to the repository root so the CI coverage check and the
      // sonar.javascript.lcov.reportPaths in sonar-project.properties resolve.
      reportsDirectory: fileURLToPath(
        new URL('../../coverage', import.meta.url),
      ),
    },
  },
});
