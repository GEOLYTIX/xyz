// esbuild.config.mjs
import * as esbuild from 'esbuild'

const buildOptions = {
    entryPoints: ['./lib/mapp.mjs', './lib/ui.mjs'],
    bundle: true,
    minify: true,
    treeShaking: false,
    sourcemap: 'inline',
    sourceRoot: '/lib',
    format: 'iife',
    outdir: './public/js/lib',
    metafile: true,
    logLevel: 'info'
};

await esbuild.build(buildOptions)
    .catch(() => process.exit(1));