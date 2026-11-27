import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { writeExamples } from '../examples.mjs';

const root = fileURLToPath(new URL('../../..', import.meta.url));

// The testhost serves the knowledge examples, combined into one workspace.
process.env.TESTHOST_WORKSPACE = writeExamples(root);

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  test: {
    include: ['*.test.mjs'],
    // Starts the devdb and the XYZ host once for the run.
    globalSetup: ['../../../packages/testhost/globalSetup.js'],
    // Loading the PostGIS extension into PGlite takes a few seconds.
    hookTimeout: 60000,
    testTimeout: 20000,
  },
});
