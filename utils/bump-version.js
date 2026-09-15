/**
## Bump version script
This script bumps the xyz framework version by a patch, minor, or major increment.

The version is stored in three files which must be kept in sync:
- package.json (with a 'v' prefix)
- README.md (first line, with a 'v' prefix)
- apps/mapp/lib/mapp.mjs (without a 'v' prefix)

To run this script execute `node utils/bump-version.js <patch|minor|major>`,
or use the package scripts `pnpm bump:patch`, `pnpm bump:minor`, `pnpm bump:major`.

@requires module:fs

@module bump-version
*/

import { readFileSync, writeFileSync } from 'node:fs';

const increment = process.argv[2];

if (!['patch', 'minor', 'major'].includes(increment)) {
  console.error('Usage: node utils/bump-version.js <patch|minor|major>');
  process.exit(1);
}

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

// Strip the 'v' prefix from the package.json version.
const current = pkg.version.replace(/^v/, '');

let [major, minor, patch] = current.split('.').map(Number);

if (increment === 'major') {
  major += 1;
  minor = 0;
  patch = 0;
} else if (increment === 'minor') {
  minor += 1;
  patch = 0;
} else {
  patch += 1;
}

const next = `${major}.${minor}.${patch}`;

// package.json keeps the 'v' prefix.
pkg.version = `v${next}`;
writeFileSync('./package.json', `${JSON.stringify(pkg, null, 2)}\n`);

// README.md displays the version with a 'v' prefix on the first line.
const readme = readFileSync('./README.md', 'utf-8');
writeFileSync('./README.md', readme.replace(`**v${current}**`, `**v${next}**`));

// The mapp bundle attribution stores the version without a prefix.
const mapp = readFileSync('./apps/mapp/lib/mapp.mjs', 'utf-8');
writeFileSync(
  './apps/mapp/lib/mapp.mjs',
  mapp.replace(`version: '${current}',`, `version: '${next}',`),
);

console.log(`v${current} -> v${next}`);
console.log(`
Next steps:
  git commit -am "Bump version to v${next}"
  git tag v${next}
  git push && git push origin v${next}

The release workflow requires release-notes/v${next}.md to exist before the tag is pushed.`);
