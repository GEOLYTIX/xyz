# Releasing XYZ

Pushing a `v*` tag creates a GitHub release using `release-notes/<tag>.md`. It **does not deploy the app or publish an npm package**. For deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md).

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

**The filename must match the tag exactly, including the `v` prefix, and the notes must be committed before tagging.**

## 3. Check, build, and merge

```bash
pnpm exec biome check .
pnpm test
NODE_ENV=production pnpm build --filter=@geolytix/mapp
git diff --stat
git status --short
```

Stop and resolve any failures. The MAPP build regenerates tracked files in `public/js/lib` and `public/css`; review and include those changes so the shipped bundle matches the source version.

```bash
git add package.json README.md apps/mapp/lib/mapp.mjs \
  release-notes/v5.0.3.md public/js/lib public/css
git diff --cached
git commit -m "Prepare release v5.0.3"
git push -u origin release/v5.0.3
```

Open a pull request into `main`, wait for the required checks and review, then merge it.

## 4. Publish the tag

After merging, update your local `main`:

```bash
git switch main
git pull --ff-only origin main
git log -1 --oneline
node -p "require('./package.json').version"
test -f release-notes/v5.0.3.md
```

Before continuing, confirm this is the intended release commit, the version is `v5.0.3`, the notes exist, and CI is green for that commit. The release workflow does **not** run tests or wait for other checks.

**The next commands publish the release:**

```bash
git tag -a v5.0.3 -m "Release v5.0.3"
git push origin v5.0.3
```

Push only the intended tag, not `--tags`. Never move or overwrite a published release tag.

## 5. Verify

- Check [Actions → Release](https://github.com/GEOLYTIX/xyz/actions/workflows/release.yml) succeeds.
- Check [Releases](https://github.com/GEOLYTIX/xyz/releases) shows the correct version and notes.
- Deploy separately if needed, following [DEPLOYMENT.md](./DEPLOYMENT.md).

If the workflow fails, read its log first. Missing notes must be fixed in a new commit and released under a new version/tag; re-running the same tag will still use the old commit. For a transient failure, check whether the release already exists before re-running the failed job.
