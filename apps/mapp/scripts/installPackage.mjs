/**
The installPackage script installs the @geolytix/mapp package into tests-package/node_modules for the package test.

Without arguments, the script installs the tarball from `.pack/geolytix-mapp.tgz`, which is written by scripts/pack.mjs.

With `--registry=<url>`, the script installs the packed version from that registry, eg. a local Verdaccio registry the tarball was published to. Only the @geolytix scope is requested from the registry.

npm installs the `ol` peer dependency from the npm registry. The package test loads Openlayers from the installed `ol` package.

@example
pnpm --filter=@geolytix/mapp pack:install

// From apps/mapp. pnpm would read --registry as its own option.
node scripts/installPackage.mjs --registry=http://localhost:4873
*/

import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { run } from './run.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const prefix = join(root, 'tests-package');
const tarball = join(root, '.pack', 'geolytix-mapp.tgz');

const registry = process.argv
  .find((arg) => arg.startsWith('--registry='))
  ?.split('=')[1];

if (!existsSync(tarball)) {
  console.error(
    '.pack/geolytix-mapp.tgz is missing. Run pnpm pack:check first.',
  );
  process.exit(1);
}

rmSync(join(prefix, 'node_modules'), { force: true, recursive: true });

let spec = tarball;
const scope = [];

if (registry) {
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

const installed = JSON.parse(
  readFileSync(
    join(prefix, 'node_modules', '@geolytix', 'mapp', 'package.json'),
    'utf-8',
  ),
);

console.log(
  `Installed ${installed.name}@${installed.version} from ${registry ?? '.pack/geolytix-mapp.tgz'} into tests-package/node_modules.`,
);
