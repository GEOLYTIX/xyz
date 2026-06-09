import { fileURLToPath } from 'node:url';
import { varlockVitePlugin } from '@varlock/vite-integration';
import { ENV } from 'varlock/env';
import { defineConfig } from 'vite';

const isDevelopmentBuild = ENV.NODE_ENV === 'DEVELOPMENT';

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: {
        mapp: fileURLToPath(new URL('./lib/mapp.mjs', import.meta.url)),
        ui: fileURLToPath(new URL('./lib/ui.mjs', import.meta.url)),
      },
      fileName: (_format, entryName) => `${entryName}.js`,
      formats: ['es'],
    },
    minify: isDevelopmentBuild ? false : 'oxc',
    outDir: fileURLToPath(new URL('../../public/js/lib', import.meta.url)),
    rolldownOptions: {
      output: {
        minify: !isDevelopmentBuild,
      },
    },
    sourcemap: true,
  },
  plugins: [varlockVitePlugin({ ssrInjectMode: 'resolved-env' })],
});
