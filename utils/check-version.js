/**
## Check version script
This script checks that the xyz framework version is the same in the four files which store it:
- package.json (with a 'v' prefix)
- README.md (first line, with a 'v' prefix)
- apps/mapp/lib/mapp.mjs (without a 'v' prefix)
- apps/mapp/package.json, the @geolytix/mapp npm package (without a 'v' prefix)

utils/bump-version.js sets the version in all four files. The script exits with code 1 if a version differs or can't be read.

To run this script execute `node utils/check-version.js` from the repository root.

@requires module:fs

@module check-version
*/

import { readFileSync } from 'node:fs';

const versions = {
  'package.json': JSON.parse(
    readFileSync('./package.json', 'utf-8'),
  ).version?.replace(/^v/, ''),
  'README.md': readFileSync('./README.md', 'utf-8').match(
    /^\*\*v([^*]+)\*\*/,
  )?.[1],
  'apps/mapp/lib/mapp.mjs': readFileSync(
    './apps/mapp/lib/mapp.mjs',
    'utf-8',
  ).match(/version: '([^']+)',/)?.[1],
  'apps/mapp/package.json': JSON.parse(
    readFileSync('./apps/mapp/package.json', 'utf-8'),
  ).version,
};

const expected = versions['package.json'];

const mismatches = Object.entries(versions).filter(
  ([, version]) => !version || version !== expected,
);

if (mismatches.length) {
  console.error(
    `The versions don't match the package.json version ${expected}:`,
  );
  for (const [file, version] of mismatches) {
    console.error(`  ${file}: ${version ?? 'not found'}`);
  }
  process.exit(1);
}

console.log(`The versions match: ${expected}`);
