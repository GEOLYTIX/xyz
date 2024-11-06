// esbuild.config.mjs
import * as esbuild from 'esbuild'

const isDev = process.env.NODE_ENV !== 'DEVELOPMENT';

const buildOptions = {
    entryPoints: ['./lib/mapp.mjs', './lib/ui.mjs'],
    bundle: true,
    minify: isDev,
    sourcemap: true,
    sourceRoot: '/lib',
    format: 'iife',
    outdir: './public/js/lib',
    metafile: true,
    logLevel: 'info'
};

try {
    await esbuild.build(buildOptions);
} catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
}