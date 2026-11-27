---
type: Guide
title: GitHub Codespaces
description: Run XYZ/MAPP in the browser from a fork in GitHub Codespaces, without a local install; use for a first try or a workshop.
tags: [deployment, setup, codespaces]
status: draft
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Getting-Started-with-Codespaces/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: gitignore
    resource: ../../.gitignore
  - id: workspace
    resource: ../../public/workspace.json
  - id: package
    resource: ../../package.json
---
# GitHub Codespaces

A codespace runs VS Code and a Linux container in the browser. Everything in
[local development](local-development.md) applies; this guide lists the steps
which differ. It needs a GitHub account and nothing installed locally.[^wiki]

## 1. Fork and create a codespace

Fork the repository from <https://github.com/GEOLYTIX/xyz/fork>. A codespace
also works on the public repository, but a fork keeps your changes. Only the
`main` branch is needed.

On the fork, open **Code → Codespaces → Create codespace on main**. The
repository has no `.devcontainer`, so GitHub's default image is used.

## 2. Set up the tools

```bash
node -v                 # must be 22 or later
nvm install --lts       # only if it is older
npm install -g pnpm@11  # the root packageManager pins pnpm 11.3.0
pnpm install
```

`main` carries the built MAPP and MAPP.UI bundles, so `pnpm build` is only
needed after changing `apps/mapp` or `apps/ui`, or on a development branch,
where the bundles are gitignored, see
[release builds](release-builds.md).[^gitignore]

## 3. Workspace and environment

`public/workspace.json` already exists in the repository with an OSM tile
layer on the default locale.[^workspace] Point the environment at it in a
root `.env`:

```dotenv
WORKSPACE=file:/public/workspace.json
```

`file:` paths resolve from `XYZ_CWD`, the repository root by default. The
[workspace](../workspace/locales.md) concepts describe locales and layers.

## 4. Launch

`pnpm dev` runs the server through Varlock, which reads `.env` together with
an `.env.schema` (copy both from `varlock/`, see
[local development](local-development.md#environment)). In the Run and Debug
panel (Ctrl+Shift+D) a launch configuration can start the server instead; use
one which reads `.env`, see
[running locally](running-locally.md#vs-code-launch-configurations).

The program is `apps/xyz/server.js`. The root `express.js` of v4 is gone.

## 5. Open the application

The **Ports** tab lists the forwarded port, 3000 by default. Open it to see
the default view with the OSM layer. A port can be made public to open it in
another browser or on a phone; anyone with the URL can then reach the
instance.

## Next steps

- Add a PostGIS layer from a hosted database: [Neon](neon.md).
- Explore the [layer keys](../workspace/layer/index.md) and
  [location views](../workspace/location/index.md). Things to try: name
  the layer, display it by default, let users toggle edit mode, add a `type`
  field with the options `New` and `Existing` and a theme on it, add infoj
  filters, and try the plugins in `apps/mapp/lib/plugins`.
- Deploy to [Vercel](vercel.md) from the codespace terminal.

[^wiki]: Wiki Getting-Started-with-Codespaces page.
[^gitignore]: .gitignore excludes `public/js/lib/` and the MAPP css outside `main`.
[^workspace]: public/workspace.json.
