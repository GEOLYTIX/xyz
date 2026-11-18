/**
The copyPublic script copies the MAPP bundle, its sourcemap and the css from the dist directory into the public directory of the repository root.

The dist directory is the content of the @geolytix/mapp npm package. The XYZ views load the bundle from public/js/lib/mapp.js and the css from public/css/mapp.css.

The script runs as the last step of the package build.

@example
pnpm build --filter=@geolytix/mapp
*/

import { copyFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dist = new URL('../dist/', import.meta.url);
const pub = new URL('../../../public/', import.meta.url);

const files = [
  ['mapp.js', 'js/lib/mapp.js'],
  ['mapp.js.map', 'js/lib/mapp.js.map'],
  ['mapp.css', 'css/mapp.css'],
];

mkdirSync(new URL('js/lib/', pub), { recursive: true });
mkdirSync(new URL('css/', pub), { recursive: true });

for (const [from, to] of files) {
  copyFileSync(
    fileURLToPath(new URL(from, dist)),
    fileURLToPath(new URL(to, pub)),
  );
}
