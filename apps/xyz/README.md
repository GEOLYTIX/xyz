## XYZ API

The XYZ API is a collection of JavaScript modules for Node.js web application frameworks.

An Express application script is provided in this app at `server.js`.

XYZ API modules should be run with a Node.js runtime v22 or higher.

The [XYZ API](/xyz/module-_api.html) module is located in the api folder as a requirement for using the offical Node.js runtime in Vercel's Edge Network.

All other XYZ API modules are located in the /mod directory.

JSDoc is used to documented any XYZ API module, function, and their parameter.

The [clean-jsdoc-theme](https://www.npmjs.com/package/clean-jsdoc-theme) is used to build the XYZ and MAPP API reference pages which can be built and hosted local with the provided Express application script.

The XYZ API modules are:

### [Workspace](/xyz/module-_workspace)

### [View](/xyz/module-_view)

### [Query](/xyz/module-_query)

### [User](/xyz/module-_user)

### [Sign](/xyz/module-_sign)

## Development

The XYZ server imports `apps/xyz/mod/utils/processEnv.js` before routes are created. Local runtime and test commands launch through `varlock run --`, so the loader initializes from the serialized Varlock environment, applies server defaults, creates the frozen `globalThis.xyzEnv` object, and patches console/HTTP output so sensitive Varlock values are redacted.

For local development, create a root `.env` file and validate it with:

```bash
pnpm exec varlock load --compact
```

For Vercel deployments, run `pnpm freeze-env --env=production` before deploying. The generated `.varlock.blob` is included by `vercel.json` and read by `processEnv.js` at runtime, so the serverless function does not call Google Secret Manager during requests.

From the repository root, start the XYZ app server with:

```bash
pnpm dev
```

From `apps/xyz`, run the package dev script directly:

```bash
pnpm dev
```

## Tests

From the repository root, run XYZ tests with:

```bash
pnpm test:xyz
```
