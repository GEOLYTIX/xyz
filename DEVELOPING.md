# Developing

## Setting up development environment

Start by [forking](https://github.com/GEOLYTIX/xyz/fork) the XYZ repository.

### Development dependencies

The minimum requirements are:

- Git
- [Node.js](https://nodejs.org/) version 22 and above
- [pnpm](https://pnpm.io/) version 11, as pinned by `packageManager` in the root `package.json`

The executables `git`, `node`, and `pnpm` should be in your `PATH`.

Install workspace dependencies from the repository root:

```bash
pnpm install
```

For a current clone-to-first-run walkthrough, see [local development](./knowledge/deployment/local-development.md).

## App Development

App-specific build and development notes live with each app:

- [XYZ app](./apps/xyz/README.md)
- [MAPP app](./apps/mapp/README.md)
- [MAPP.UI app](./apps/ui/README.md)
- [SAML app](./apps/saml/README.md)

## Test Debugging [VSCode]

We recommend to use the vitest extension for VSCode to debug XYZ modules through the test scripts. See [VS Code](./TESTING.md#vs-code) in TESTING.md.

## Biome

The codebase uses [Biome](https://biomejs.dev/) for linting and formatting.

Check for issues from the repository root:

```bash
pnpm exec biome check .
```

Apply safe fixes where possible:

```bash
pnpm exec biome check --write .
```

Format files:

```bash
pnpm exec biome format --write .
```

Many editors have Biome extensions or plugins for on-the-fly error highlighting and formatting. See the [Biome editor integration guide](https://biomejs.dev/docs/integrations/editors/) for setup instructions.

## Knowledge

A change to behaviour described in the [knowledge bundle](./knowledge/index.md) updates the concept in the same pull request. Read the [authoring workflow](./knowledge/workflows/authoring.md) before editing concepts, then check the bundle:

```bash
pnpm knowledge:check                          # structure, source links and examples
pnpm knowledge:changed --base origin/<base>   # concepts linking the modules the branch changed
```

`<base>` is the target branch, eg. `patch`. Label the pull request `knowledge-unaffected` when a change leaves the concepts true. The [Knowledge check](./.github/workflows/knowledge-check.yml) and [Knowledge freshness](./.github/workflows/knowledge-freshness.yml) workflows run these checks on pull requests. See [knowledge checks](./knowledge/workflows/checks.md) and [DOCUMENTATION.md](./DOCUMENTATION.md).

## Related Docs

- [SETUP.md](./SETUP.md): clone, configuration, and local startup
- [RELEASING.md](./RELEASING.md): version bumps, release notes, and publishing a GitHub release
- [DEPLOYMENT.md](./DEPLOYMENT.md): Vercel and self-hosted deployment workflows
- [TESTING.md](./TESTING.md): test structure and commands
- [DOCUMENTATION.md](./DOCUMENTATION.md): the knowledge portal, the Wiki stubs and JSDoc conventions
