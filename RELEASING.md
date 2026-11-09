# Releasing XYZ

Merging a version bump into `main` releases it. The [release workflow](./.github/workflows/release.yml) runs on every push to `main`. For a version which has no tag yet it:

1. runs the tests,
2. builds the MAPP and MAPP.UI bundles into `public/js/lib`, `public/css/mapp.css` and `public/css/ui.css`,
3. commits the bundles on top of `main` in a `Build <tag>` commit,
4. tags that commit and pushes `main` and the tag together,
5. creates a GitHub release using `release-notes/<tag>.md`,
6. merges `main` into `patch` without the bundles and pushes `patch`.

The bundles are gitignored and are not tracked on the development branches (`patch`, `minor`, `major`), so they never cause merge conflicts there. Only `main` and the release tags track them, which makes a checkout of `main`, a release tag, or a source archive deployable without a build.

A squash merge from a development branch removes the bundles from `main`, because the development branch does not track them. The workflow rebuilds and commits the bundles on any push to `main` which does not contain them, also when the version is already tagged.

The workflow pushes to the protected `main` and `patch` branches with the `PAT_TOKEN` repository secret. The token owner must be allowed to push to `main` and to bypass the pull request rule on both branches.

The workflow **does not deploy the app or publish an npm package**. For deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md). The MAPP library is published to npm manually, see [Publish the MAPP library to npm](#publish-the-mapp-library-to-npm).

The example below releases **v5.0.3**. Replace that version everywhere with your target version.

## 1. Start from main

Run commands from the repository root with a clean working tree (`git status --short` should show nothing). You need permission to push release tags to `GEOLYTIX/xyz`, plus the tools described in [SETUP.md](./SETUP.md). Use the pnpm version in the root `package.json`.

These commands assume `origin` is `GEOLYTIX/xyz`, not your fork. Check with `git remote -v` first.

```bash
git switch main
git pull --ff-only origin main
git fetch origin --tags
git switch -c release/v5.0.3
pnpm install --frozen-lockfile
```

## 2. Bump the version and write the notes

Choose **one** command:

| Release type | Use for | Command |
| --- | --- | --- |
| Patch | Backwards-compatible bug fixes | `pnpm bump:patch` |
| Minor | Backwards-compatible features | `pnpm bump:minor` |
| Major | Breaking changes | `pnpm bump:major` |

The script increments the current version in `package.json`, `README.md`, `apps/mapp/lib/mapp.mjs` and `apps/mapp/package.json`. Check all four with `git diff`, and check they match with `node utils/check-version.js`. **Do not run it again if the target version is already set.** It does not create a commit or tag.

Create or update `release-notes/v5.0.3.md`. Summarise the changes, link relevant PRs, and explain any breaking changes or migration steps. Follow an [existing example](./release-notes/v5.0.3.md).

**The filename must match the version exactly, including the `v` prefix, and the notes must be in the same pull request as the version bump.** The workflow fails without them.

## 3. Check and merge

```bash
pnpm exec biome check .
pnpm test
pnpm build --filter=@geolytix/mapp --filter=@geolytix/mapp-ui
git status --short
```

Stop and resolve any failures. The local build only checks that the bundles build. A branch from `main` tracks the bundles, so discard the rebuilt files before committing: `git restore public/js/lib public/css/mapp.css public/css/ui.css`. The workflow commits the release build.

```bash
git add package.json README.md apps/mapp/lib/mapp.mjs apps/mapp/package.json release-notes/v5.0.3.md
git diff --cached
git commit -m "Prepare release v5.0.3"
git push -u origin release/v5.0.3
```

Open a pull request into `main` and wait for the required checks and review. **Merging the pull request publishes the release.** Do not create or push the tag yourself; the workflow skips a version which is already tagged, so a manual tag would release without bundles.

## 4. Verify

- Check [Actions → Release](https://github.com/GEOLYTIX/xyz/actions/workflows/release.yml) succeeds.
- Check [Releases](https://github.com/GEOLYTIX/xyz/releases) shows the correct version and notes.
- Check `main` and the tag contain the bundles: `git fetch origin --tags && git ls-tree -r --name-only v5.0.3 public/js/lib && git ls-tree -r --name-only origin/main public/js/lib`.
- Deploy separately if needed, following [DEPLOYMENT.md](./DEPLOYMENT.md).

## 5. Sync the development branch

The workflow merges `main` into `patch` after each release; check `patch` has a new `Merge main into patch` commit. The sync step fails when the merge conflicts in files other than the bundles, eg. when `patch` received changes during the release. Sync `patch` manually in that case.

Merging `main` either adds the bundles or stops with a modify/delete conflict on them; untracking them resolves both cases and keeps the built files in the working tree.

```bash
git switch patch
git pull --ff-only origin patch
git fetch origin main
git merge --no-commit origin/main
git rm -r --cached --ignore-unmatch --quiet public/js/lib public/css/mapp.css public/css/ui.css
git status --short
git commit -m "Merge main into patch"
git push origin patch
```

`git status --short` must not list any other conflicts or bundle files before the commit.

If the workflow fails before the tag is pushed, fix the cause in a new commit to `main`, or re-run the failed job for a transient failure. The next push to `main` retries the release while the version is still untagged. If the tag was pushed but the GitHub release is missing, re-run the job; it skips the build when `main` already contains the bundles and only creates the release. Never move or overwrite a published release tag.

## Publish the MAPP library to npm

The MAPP library is published to npm as [`@geolytix/mapp`](https://www.npmjs.com/package/@geolytix/mapp). Publishing is manual for now. The release workflow doesn't publish to npm.

The package version is the XYZ release version. The MAPP library doesn't change in every release, so after a release a maintainer decides whether to publish it. Check for MAPP changes since the last published version:

```bash
npm view @geolytix/mapp dist-tags
git diff --stat v5.1.0 v5.1.3 -- apps/mapp/lib apps/mapp/css
```

A published version can't be changed or reused, and npm limits unpublishing. Releases without MAPP changes are not published, so the npm versions can have gaps, eg. `5.1.0` and then `5.1.3`.

### Publish with the workflow

The [Publish MAPP workflow](./.github/workflows/publish_mapp.yml) only runs on a manual dispatch from [Actions → Publish MAPP](https://github.com/GEOLYTIX/xyz/actions/workflows/publish_mapp.yml), or with the GitHub CLI:

```bash
# A release, after the release workflow pushed the tag.
gh workflow run publish_mapp.yml -f ref=v5.1.0 -f dist_tag=latest

# A prerelease from a development branch, published as 5.1.0-rc.2.
gh workflow run publish_mapp.yml -f ref=minor -f dist_tag=next -f prerelease=rc.2
```

| Input | Description |
| --- | --- |
| `ref` | The release tag for `latest`, eg. `v5.1.0`. A branch or tag for `next`. |
| `dist_tag` | `latest` for a release, `next` for a prerelease. |
| `prerelease` | The prerelease identifier for `next`, eg. `rc.2`. The version is the `apps/mapp/package.json` version with the identifier, eg. `5.1.0-rc.2`. |

The workflow checks that the versions match and that the version isn't published yet. It runs the MAPP library tests, builds and packs the package, runs the package test with the tarball, and publishes the tarball with provenance. The prerelease version is only set in the workflow checkout and isn't committed.

The publish job runs in the `npm` environment, which requires the approval of a reviewer. npm authenticates the workflow with trusted publishing (OIDC), so there is no npm token.

GitHub only lists a manually dispatched workflow once the workflow file is on `main`. Until then, publish locally.

### Check the published version

- The [npm page](https://www.npmjs.com/package/@geolytix/mapp) shows the version, the dist-tag and the provenance.
- The jsDelivr CDN serves the version, eg. `https://cdn.jsdelivr.net/npm/@geolytix/mapp@5.1.0/dist/mapp.js`.
- The [cdn view](./packages/testhost/README.md#cdn) of the testhost loads the version from jsDelivr: `pnpm testview` and open `/views/cdn/?version=5.1.0`.

### Publish locally

The first version must be published locally by an owner of the `geolytix` npm organisation, because npm trusted publishing can only be set up for a package which exists. A local publish has no provenance and requires npm two-factor authentication.

```bash
pnpm install --frozen-lockfile
pnpm test:mapp
pnpm build --filter=@geolytix/mapp --force
cd apps/mapp
npm pkg set version=5.1.0-rc.1   # a prerelease only, don't commit the change
pnpm pack:check
pnpm pack:install
pnpm test:package
cd .pack
npm login
npm publish geolytix-mapp.tgz --access public --tag next
cd .. && git restore package.json
```

### Set up trusted publishing

After the first publish, an owner of the `geolytix` npm organisation sets up the package once:

1. Create the `npm` environment in the GitHub repository settings with required reviewers, and restrict it to the `main` branch and the `v*` tags. Add `minor` and `patch` to publish prereleases from them.
2. On npm, open the `@geolytix/mapp` package settings and add a trusted publisher: GitHub Actions, organisation `GEOLYTIX`, repository `xyz`, workflow `publish_mapp.yml`, environment `npm`.
3. Set the publishing access of the package to require two-factor authentication and disallow tokens. The trusted publisher isn't affected.
