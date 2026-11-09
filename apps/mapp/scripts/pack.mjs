/**
The pack script packs the @geolytix/mapp npm package and checks the tarball before it is published.

The package must be built first. The script:

1. copies the package files into `.pack/stage` with a package.json without the `devDependencies` and `scripts`. The development dependencies use `workspace:` and `catalog:` specifiers, and the private testhost package, which must not be published.
2. packs the staged package with `npm pack` into `.pack/geolytix-mapp.tgz`.
3. checks that the tarball contains only the expected files.
4. checks that the packed package.json has no `workspace:` or `catalog:` specifiers, and that the `exports` targets are in the tarball.
5. runs `npm publish --dry-run` with the tarball. A prerelease version is checked with the `next` dist-tag.

The tarball is installed for the package test with scripts/installPackage.mjs, and published from `.pack/geolytix-mapp.tgz`.

@example
pnpm build --filter=@geolytix/mapp
pnpm --filter=@geolytix/mapp pack:check
*/

import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { run } from './run.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const packDir = join(root, '.pack');
const stageDir = join(packDir, 'stage');
const tarball = 'geolytix-mapp.tgz';

const expectedFiles = [
  'package/LICENSE',
  'package/README.md',
  'package/dist/mapp.css',
  'package/dist/mapp.js',
  'package/dist/mapp.js.map',
  'package/package.json',
];

function fail(message) {
  console.error(message);
  process.exit(1);
}

for (const file of ['dist/mapp.js', 'dist/mapp.js.map', 'dist/mapp.css']) {
  if (!existsSync(join(root, file))) {
    fail(`${file} is missing. Build the package with pnpm build first.`);
  }
}

rmSync(packDir, { force: true, recursive: true });

mkdirSync(stageDir, { recursive: true });

for (const file of ['dist', 'README.md', 'LICENSE']) {
  cpSync(join(root, file), join(stageDir, file), { recursive: true });
}

const { devDependencies, scripts, ...stagedPkg } = JSON.parse(
  readFileSync(join(root, 'package.json'), 'utf-8'),
);

writeFileSync(
  join(stageDir, 'package.json'),
  `${JSON.stringify(stagedPkg, null, 2)}\n`,
);

run('npm', ['pack', '--pack-destination', '..'], { cwd: stageDir });

rmSync(stageDir, { force: true, recursive: true });

const packed = readdirSync(packDir).filter((file) => file.endsWith('.tgz'));

if (packed.length !== 1) fail(`Expected one tarball in .pack: ${packed}`);

renameSync(join(packDir, packed[0]), join(packDir, tarball));

// The relative tarball path, because GNU tar reads a Windows drive letter as a remote host.
const files = run('tar', ['-tzf', tarball], { cwd: packDir })
  .split('\n')
  .map((file) => file.trim())
  .filter(Boolean)
  .sort();

const missing = expectedFiles.filter((file) => !files.includes(file));
const unexpected = files.filter((file) => !expectedFiles.includes(file));

if (missing.length || unexpected.length) {
  fail(`The tarball content is not as expected.
Missing: ${missing.join(', ') || 'none'}
Unexpected: ${unexpected.join(', ') || 'none'}`);
}

run('tar', ['-xzf', tarball, 'package/package.json'], { cwd: packDir });

const manifest = readFileSync(join(packDir, 'package/package.json'), 'utf-8');

rmSync(join(packDir, 'package'), { force: true, recursive: true });

if (/"(workspace|catalog):/.test(manifest)) {
  fail('The packed package.json has workspace: or catalog: specifiers.');
}

const pkg = JSON.parse(manifest);

const targets = [pkg.module, pkg.browser, ...Object.values(pkg.exports)];

for (const target of targets) {
  if (!files.includes(`package/${target.replace(/^\.\//, '')}`)) {
    fail(`The package.json target ${target} is not in the tarball.`);
  }
}

// npm requires a dist-tag to publish a prerelease version.
const tag = pkg.version.includes('-') ? 'next' : 'latest';

run(
  'npm',
  ['publish', tarball, '--dry-run', '--access', 'public', '--tag', tag],
  { cwd: packDir },
);

console.log(`Packed ${pkg.name}@${pkg.version} into .pack/${tarball}:
${files.map((file) => `  ${file}`).join('\n')}

npm publish --dry-run --tag ${tag} passed.`);
