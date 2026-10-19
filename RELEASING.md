# Releasing XYZ

Merging a version bump into `main` releases it. The [release workflow](./.github/workflows/release.yml) runs on every push to `main`. For a version which has no tag yet it:

1. runs the tests,
2. builds the MAPP bundles into `public/js/lib`, `public/css/mapp.css` and `public/css/ui.css`,
3. commits the bundles on top of `main` in a `Build <tag>` commit,
4. tags that commit and pushes `main` and the tag together,
5. creates a GitHub release using `release-notes/<tag>.md`,
6. merges `main` into `patch` without the bundles and pushes `patch`.

The bundles are gitignored and are not tracked on the development branches (`patch`, `minor`, `major`), so they never cause merge conflicts there. Only `main` and the release tags track them, which makes a checkout of `main`, a release tag, or a source archive deployable without a build.

A squash merge from a development branch removes the bundles from `main`, because the development branch does not track them. The workflow rebuilds and commits the bundles on any push to `main` which does not contain them, also when the version is already tagged.

The workflow pushes to the protected `main` and `patch` branches with the `PAT_TOKEN` repository secret. The token owner must be allowed to push to `main` and to bypass the pull request rule on both branches.

The workflow **does not deploy the app or publish an npm package**. For deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md).

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

The script increments the current version in `package.json`, `README.md`, and `apps/mapp/lib/mapp.mjs`. Check all three with `git diff`. **Do not run it again if the target version is already set.** It does not create a commit or tag.

Create or update `release-notes/v5.0.3.md`. Summarise the changes, link relevant PRs, and explain any breaking changes or migration steps. Follow an [existing example](./release-notes/v5.0.3.md).

**The filename must match the version exactly, including the `v` prefix, and the notes must be in the same pull request as the version bump.** The workflow fails without them.

## 3. Check and merge

```bash
pnpm exec biome check .
pnpm test
pnpm build --filter=@geolytix/mapp
git status --short
```

Stop and resolve any failures. The local build only checks that the bundles build. A branch from `main` tracks the bundles, so discard the rebuilt files before committing: `git restore public/js/lib public/css/mapp.css public/css/ui.css`. The workflow commits the release build.

```bash
git add package.json README.md apps/mapp/lib/mapp.mjs release-notes/v5.0.3.md
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
