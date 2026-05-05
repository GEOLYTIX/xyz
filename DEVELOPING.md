# Developing

## Setting up development environment

Start by [forking](https://github.com/GEOLYTIX/xyz/fork) the XYZ repository.

### Development dependencies

The minimum requirements are:

- Git
- [Node.js](https://nodejs.org/) version 22 and above
- [pnpm](https://pnpm.io/) version 10

The executables `git`, `node`, and `pnpm` should be in your `PATH`.

Install workspace dependencies from the repository root:

```bash
pnpm install
```

For a current clone-to-first-run walkthrough, see [SETUP.md](./SETUP.md).

## App Development

App-specific build and development notes live with each app:

- [XYZ app](./apps/xyz/README.md)
- [MAPP app](./apps/mapp/README.md)
- [SAML app](./apps/saml/README.md)

## Test Debugging

You can debug Vitest tests with the following VSCode launch config:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "autoAttachChildProcesses": true,
  "skipFiles": ["<node_internals>/**", "**/node_modules/**"],
  "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
  "args": ["run", "--no-file-parallelism"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen",
  "cwd": "${workspaceFolder}"
}
```

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

## Related Docs

- [SETUP.md](./SETUP.md): clone, configuration, and local startup
- [TESTING.md](./TESTING.md): test structure and commands
- [DOCUMENTATION.md](./DOCUMENTATION.md): JSDoc and documentation notes
