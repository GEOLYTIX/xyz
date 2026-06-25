import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: false,
  build: {
    assetsDir: '.',
    cssCodeSplit: true,
    cssMinify: false,
    emptyOutDir: false,
    minify: false,
    outDir: fileURLToPath(new URL('../../public/css', import.meta.url)),
    rollupOptions: {
      input: {
        mapp: fileURLToPath(new URL('./css/_mapp.css', import.meta.url)),
        ui: fileURLToPath(new URL('./css/_ui.css', import.meta.url)),
      },
      output: {
        assetFileNames: '[name][extname]',
      },
    },
  },
});
