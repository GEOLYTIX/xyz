---
type: Guide
title: Publishing the @geolytix/mapp package
description: What the @geolytix/mapp package contains, how CI packs and tests it, and how a maintainer publishes it to npm with the Publish MAPP workflow; use before publishing or changing the package.
tags: [deployment, release, npm, mapp, ci]
status: draft
resource: ../../apps/mapp/package.json
sources:
  - id: releasing
    resource: ../../RELEASING.md
  - id: publish
    resource: ../../.github/workflows/publish_mapp.yml
  - id: package-ci
    resource: ../../.github/workflows/mapp_package.yml
  - id: pack
    resource: ../../apps/mapp/scripts/pack.mjs
  - id: install
    resource: ../../apps/mapp/scripts/installPackage.mjs
  - resource: ../../apps/mapp/scripts/registryPublish.sh
  - resource: ../../apps/mapp/tests-package/package.test.mjs
  - resource: ../../packages/testhost/README.md
---
# Publishing the @geolytix/mapp package

The MAPP library is published to npm as
[`@geolytix/mapp`](https://www.npmjs.com/package/@geolytix/mapp), and served
from npm by jsDelivr, eg.
`https://cdn.jsdelivr.net/npm/@geolytix/mapp@5.1.0/dist/mapp.js`. MAPP.UI and
the XYZ apps are not published.

## Package

The package contains `apps/mapp/dist` only: `mapp.js`, its source map and
`mapp.css`, exported as `.` and `./css`. Openlayers (`ol`) is a peer
dependency. The version is the XYZ release version, kept in step by the bump
scripts and checked by `node utils/check-version.js`.

`pnpm --filter=@geolytix/mapp pack:check` (`scripts/pack.mjs`) stages the
package without dev dependencies and scripts, packs
`apps/mapp/.pack/geolytix-mapp.tgz`, and checks its file list, the absence of
`workspace:` and `catalog:` specifiers, a gzip size budget, source map paths,
publint and an `npm publish --dry-run`.[^pack] `pack:install` installs the
tarball into `tests-package`, and `test:package` runs the browser package
test against the testhost.[^install]

## Checked on every change

The [MAPP Package workflow](../../.github/workflows/mapp_package.yml) runs on
pushes to `main`, `major`, `minor` and `patch` and on pull requests touching
the package, the testhost, the devdb or the version files. It builds, packs,
publishes the tarball to a local Verdaccio registry, installs it from there
and runs the package test. Nothing reaches npmjs.com.[^package-ci]

## Publishing

Publishing is manual and separate from the release: the release workflow
does not publish to npm. After a release a maintainer decides whether the
MAPP library changed since the last published version, eg. with
`npm view @geolytix/mapp dist-tags` and
`git diff --stat v5.1.0 v5.1.3 -- apps/mapp/lib apps/mapp/css`. Releases
without MAPP changes are not published, so npm versions have gaps. A published
version cannot be changed or reused.[^releasing]

The [Publish MAPP workflow](../../.github/workflows/publish_mapp.yml) runs only
on a manual dispatch, and publishes the ref it is dispatched from:[^publish]

| `dist_tag` | Ref | Version |
|---|---|---|
| `latest` | the release tag `v<version>` | the `apps/mapp/package.json` version |
| `next` | a branch or tag | that version with the `prerelease` input, eg. `5.1.0-rc.2` |

```bash
gh workflow run publish_mapp.yml --ref v5.1.0 -f dist_tag=latest
gh workflow run publish_mapp.yml --ref minor -f dist_tag=next -f prerelease=rc.2
```

The workflow checks the versions match, that `latest` runs on the matching
tag, and that the version is not yet published. It runs the MAPP tests,
builds, packs, tests the tarball and publishes it with provenance. The
prerelease version is only set in the workflow checkout, never committed.

- The job runs in the `npm` GitHub environment, which needs a reviewer's
  approval and whose deployment rules limit the refs that can publish.
- npm trusted publishing (OIDC) authenticates the workflow; there is no npm
  token. It needs npm 11.5.1 or later, so the job uses Node 24.
- GitHub only lists the workflow once it is on `main`, and the dispatched ref
  must contain it. Until then a maintainer publishes locally.

After the publish the workflow checks that the dist-tag points to the
version, the published integrity is that of the tested tarball, the
provenance attestation verifies, the package test passes with the version
from npmjs.com, and jsDelivr serves the same files. It then purges the
jsDelivr cache of the dist-tag URLs, which jsDelivr keeps for 12 hours. These
checks cannot undo a publish; a broken version is handled by moving the
dist-tag back, deprecating it and publishing a fix, which an owner of the
`geolytix` npm organisation does locally.

## Where the procedure lives

[RELEASING.md](../../RELEASING.md#publish-the-mapp-library-to-npm) keeps the
step-by-step commands: checking a published version locally (including the
testhost [cdn view](../../packages/testhost/README.md#cdn),
`pnpm testview` and `/views/cdn/?version=<version>`), recovering a broken
version, the first local publish, and the one-time trusted publishing setup.
This concept summarises them and changes with them.

[^releasing]: RELEASING.md, "Publish the MAPP library to npm".
[^publish]: .github/workflows/publish_mapp.yml.
[^package-ci]: .github/workflows/mapp_package.yml.
[^pack]: apps/mapp/scripts/pack.mjs.
[^install]: apps/mapp/scripts/installPackage.mjs.
