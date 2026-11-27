## XYZ API

The XYZ monorepo application is an Express router and server.

The [XYZ API architecture](../../knowledge/architecture/xyz-api.md) concept describes the router, the request flow and the API modules: workspace, view, query, user and sign. Module functions and their parameters are documented with JSDoc in the source; see [DOCUMENTATION.md](../../DOCUMENTATION.md#jsdoc).

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