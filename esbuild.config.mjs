// esbuild.config.mjs
import * as esbuild from 'esbuild'

// Get command line arguments to check for watch mode
const args = process.argv.slice(2);
const watch = args.includes('--watch');

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

if (watch) {
    // Watch mode
    const context = await esbuild.context(buildOptions);
    await context.watch();
    console.log('Watching for changes...');
} else {
    // Single build
    await esbuild.build(buildOptions)
        .catch(() => process.exit(1));
}