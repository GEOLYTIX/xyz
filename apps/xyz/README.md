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
