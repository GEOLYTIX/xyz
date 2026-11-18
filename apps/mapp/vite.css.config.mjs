import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: false,
  build: {
    assetsDir: '.',
    cssCodeSplit: true,
    cssMinify: false,
    // The css is built after the bundle into the same dist directory.
    emptyOutDir: false,
    minify: false,
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    rollupOptions: {
      input: {
        mapp: fileURLToPath(new URL('./css/_mapp.css', import.meta.url)),
      },
      output: {
        assetFileNames: '[name][extname]',
      },
    },
  },
});
