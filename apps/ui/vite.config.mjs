import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// The varlock ENV proxy is not initialized when vite evaluates the config;
// the minify toggle reads the build invocation environment directly, eg.
// NODE_ENV=DEVELOPMENT pnpm build --filter=@geolytix/mapp-ui
const isDevelopmentBuild = process.env.NODE_ENV === 'DEVELOPMENT';

export default defineConfig({
  build: {
    // The mapp and ui apps both build into public/js/lib. The directory is
    // not emptied, so the build of one app keeps the bundle of the other.
    emptyOutDir: false,
    lib: {
      entry: {
        ui: fileURLToPath(new URL('./lib/ui.mjs', import.meta.url)),
      },
      fileName: (_format, entryName) => `${entryName}.js`,
      formats: ['es'],
    },
    minify: isDevelopmentBuild ? false : 'oxc',
    outDir: fileURLToPath(new URL('../../public/js/lib', import.meta.url)),
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
