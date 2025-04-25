// esbuild.config.mjs
import * as esbuild from 'esbuild';

const isDev = process.env.NODE_ENV !== 'DEVELOPMENT';

const buildOptions = {
  bundle: true,
  entryPoints: ['./lib/mapp.mjs', './lib/ui.mjs', './tests/_mapp.test.mjs'],
  format: 'esm',
  logLevel: 'info',
  metafile: true,
  minify: isDev,
  outbase: '.',
  outdir: 'public/js',
  sourcemap: true,
};

try {
  await esbuild.build(buildOptions);
} catch (err) {
  console.error('Build failed:', err);
  process.exit(1);
}
