/**
The installPackage script installs the @geolytix/mapp package into tests-package/node_modules for the package test.

Without arguments, the script installs the tarball from `.pack/geolytix-mapp.tgz`, which is written by scripts/pack.mjs.

With `--registry=<url>`, the script installs the packed version from that registry, eg. a local Verdaccio registry the tarball was published to. Only the @geolytix scope is requested from the registry.

With `--version=<version|dist-tag>`, the script installs that published version instead of the packed version, eg. `next`. The tarball isn't required. The registry is https://registry.npmjs.org unless `--registry` is set.

npm installs the `ol` peer dependency from the npm registry, the latest version in the peer range. With `--ol=<version|range>`, eg. `--ol=10.8.0`, the script installs that `ol` version. It is installed with the package in one npm install, because a second `--no-save` install would remove the package. The package test loads Openlayers from the installed `ol` package.

@example
pnpm --filter=@geolytix/mapp pack:install

// From apps/mapp. pnpm would read --registry and --version as its own options.
node scripts/installPackage.mjs --registry=http://localhost:4873

// The published next version with the lowest ol version of the peer range.
node scripts/installPackage.mjs --version=next --ol=10.8.0
*/

import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { run } from './run.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const prefix = join(root, 'tests-package');
const tarball = join(root, '.pack', 'geolytix-mapp.tgz');

function arg(name) {
  return process.argv
    .find((arg) => arg.startsWith(`--${name}=`))
    ?.slice(name.length + 3);
}

const version = arg('version');
const registry = arg('registry') ?? (version && 'https://registry.npmjs.org');
const ol = arg('ol');

if (!version && !existsSync(tarball)) {
  console.error(
    '.pack/geolytix-mapp.tgz is missing. Run pnpm pack:check first.',
  );
  process.exit(1);
}

rmSync(join(prefix, 'node_modules'), { force: true, recursive: true });

let spec = tarball;
const scope = [];

if (version) {
  spec = `@geolytix/mapp@${version}`;
  scope.push(`--@geolytix:registry=${registry}`);
} else if (registry) {
  // The version from the packed package.json, which may be a prerelease.
  const manifest = run(
    'tar',
    ['-xzOf', 'geolytix-mapp.tgz', 'package/package.json'],
    {
      cwd: join(root, '.pack'),
    },
  );

  spec = `@geolytix/mapp@${JSON.parse(manifest).version}`;
  scope.push(`--@geolytix:registry=${registry}`);
}

run(
  'npm',
  [
    'install',
    spec,
    ...(ol ? [`ol@${ol}`] : []),
    '--prefix',
    prefix,
    '--no-save',
    '--no-package-lock',
    '--no-audit',
    '--no-fund',
    ...scope,
  ],
  { cwd: prefix },
);

const installed = (name) =>
  JSON.parse(
    readFileSync(join(prefix, 'node_modules', name, 'package.json'), 'utf-8'),
  ).version;

console.log(
  `Installed @geolytix/mapp@${installed('@geolytix/mapp')} from ${registry ?? '.pack/geolytix-mapp.tgz'} with ol@${installed('ol')} into tests-package/node_modules.`,
);
