# Releasing XYZ

Merging a version bump into `main` releases it. The [release workflow](./.github/workflows/release.yml) runs on every push to `main` and does nothing unless the `package.json` version has no tag yet. For a new version it:

1. runs the tests,
2. builds the MAPP bundles into `public/js/lib`, `public/css/mapp.css` and `public/css/ui.css`,
3. commits the bundles on top of `main` in a `Build <tag>` commit, which is **not pushed to any branch**,
4. tags that commit and pushes the tag,
5. creates a GitHub release using `release-notes/<tag>.md`.

The bundles are gitignored on every branch, so they never cause merge conflicts. The release tag is the only ref which contains them, which makes a tag checkout or source archive deployable without a build.

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

Stop and resolve any failures. The build output is gitignored and must not show up in `git status`; the local build only checks that the bundles build.

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
- Check the tag contains the bundles: `git fetch origin --tags && git ls-tree -r --name-only v5.0.3 public/js/lib`.
- Deploy separately if needed, following [DEPLOYMENT.md](./DEPLOYMENT.md).

If the workflow fails before the tag is pushed, fix the cause in a new commit to `main`, or re-run the failed job for a transient failure. The next push to `main` retries the release while the version is still untagged. If the tag was pushed but the GitHub release is missing, a re-run skips the existing tag, so create the release manually with `gh release create v5.0.3 --verify-tag --title v5.0.3 --notes-file release-notes/v5.0.3.md`. Never move or overwrite a published release tag.
