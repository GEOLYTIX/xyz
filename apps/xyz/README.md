## XYZ API

The XYZ monorepo application is an Express router and server.

JSDoc is used to documented any XYZ API module, function, and their parameter.

The [clean-jsdoc-theme](https://www.npmjs.com/package/clean-jsdoc-theme) is used to build the XYZ and MAPP API reference pages which can be built and hosted local with the provided Express application script.

The XYZ API modules are:

### [Workspace](/xyz/module-_workspace)

### [View](/xyz/module-_view)

### [Query](/xyz/module-_query)

### [User](/xyz/module-_user)

### [Sign](/xyz/module-_sign)

### Running a local XYZ server

The dev turbo task can be executed by runniung the dev script defined in the xyz app package.json.

```
pnpm dev
```

### Environment variables
The node process which runs the xyz express app can be configured with environment variables in an env file in the repository root.

Please refer to the [varlock documentation](../../varlock/README.md) for schema validation and protection of sensitive environment variables.

### Tests
Please refer to [TESTING.md](../../TESTING.md) in regards to testing the individual XYZ monorepo apps.