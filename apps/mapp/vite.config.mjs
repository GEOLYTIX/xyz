import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// The varlock ENV proxy is not initialized when vite evaluates the config;
// the minify toggle reads the build invocation environment directly, eg.
// NODE_ENV=DEVELOPMENT pnpm build --filter=@geolytix/mapp
const isDevelopmentBuild = process.env.NODE_ENV === 'DEVELOPMENT';

export default defineConfig({
  build: {
    // The dist directory is the content of the npm package. The build empties
    // it, and scripts/copyPublic.mjs copies the bundle into public/js/lib for
    // the XYZ views.
    emptyOutDir: true,
    lib: {
      entry: {
        mapp: fileURLToPath(new URL('./lib/mapp.mjs', import.meta.url)),
      },
      fileName: (_format, entryName) => `${entryName}.js`,
      formats: ['es'],
    },
    minify: isDevelopmentBuild ? false : 'oxc',
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    rolldownOptions: {
      output: {
        // build.minify alone does not compress whitespace in lib mode; the
        // rolldown output option enables full minification.
        minify: !isDevelopmentBuild,
      },
    },
    sourcemap: true,
  },
});
