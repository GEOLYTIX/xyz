# DOCUMENTATION

This document describes where the XYZ/MAPP documentation lives, how it is published, and the conventions for JSDoc comments in the source code.

## Knowledge portal

The [knowledge portal](https://geolytix.github.io/xyz/) is the documentation of XYZ/MAPP. It renders the [knowledge bundle](knowledge/index.md) in `knowledge/`, written in the [Open Knowledge Format](knowledge/about.md) (OKF) v0.3: architecture, environment variables, workspace configuration, views, security, deployment and development workflows.

The bundle is the source of truth. Concepts are changed in pull requests together with the code they describe, and `pnpm knowledge:check` validates their structure and source links in CI. `pnpm knowledge:changed` fails a pull request which changes a concept's `resource` module without the concept, unless it carries the `knowledge-unaffected` label. Read the [authoring workflow](knowledge/workflows/authoring.md) before editing concepts, and see [agent guidance](AGENTS.md) for how agents use the bundle.

The portal is built with [VitePress](https://vitepress.dev/). Its configuration lives in `utils/knowledge/site/`, outside the bundle.

```bash
pnpm knowledge:site:dev       # dev server with hot reload on http://localhost:5173/xyz/
pnpm knowledge:site:build     # static build in utils/knowledge/site/.vitepress/dist
pnpm knowledge:site:preview   # serve the build on http://localhost:4173/xyz/
```

Review a pull request which changes the bundle or the portal with a local build: `pnpm knowledge:site:build` fails on dead links, and `pnpm knowledge:site:preview` serves the pages as they are deployed. Pull requests are not deployed to GitHub Pages.

The `deploy-docs.yml` workflow builds the portal and deploys it to GitHub Pages. The Release workflow calls it with the release tag after it has created a release. A maintainer can run the workflow manually with `main`, `minor`, `patch`, a release tag or a full commit SHA to publish a correction between releases. Run it from the release line which carries the correction, eg. `patch`, so that the portal does not describe unreleased behaviour. The portal footer names the version and the tag or commit it was built from. The knowledge check workflow builds the portal on pull requests, so dead links fail before publishing.

See [documentation publishing](knowledge/decisions/documentation-publishing.md) for the decision.

## WIKI

The [repository Wiki](https://github.com/GEOLYTIX/xyz/wiki) is no longer documentation and is not edited by hand. It has a Home page which points to the portal, an Open Knowledge Format page generated from [knowledge/about.md](knowledge/about.md), and a stub for each former Wiki page that links to its replacement in the portal, so old links keep working.

The stubs are generated from the table in the [Wiki migration inventory](knowledge/workflows/wiki-migration.md). Regenerate them after that table or `knowledge/about.md` changes:

```bash
git clone https://github.com/GEOLYTIX/xyz.wiki.git ../xyz.wiki
pnpm knowledge:wiki ../xyz.wiki
```

The script replaces every Markdown page in the checkout. Review the diff, then commit and push the Wiki checkout.

## README and root documents

The [README.md](README.md) is the landing page of the repository. [CONTRIBUTING](CONTRIBUTING.md), [DEVELOPING](DEVELOPING.md), [TESTING](TESTING.md), [RELEASING](RELEASING.md), the [LICENSE](LICENSE) and the [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md) stay in the repository root. [SETUP](SETUP.md) and [DEPLOYMENT](DEPLOYMENT.md) point to the deployment concepts in the bundle. App READMEs cover app-specific commands; `apps/mapp/README.md` is the npm package page of `@geolytix/mapp`.

## JSDOC

XYZ/MAPP source code is annotated with [JSDoc](https://jsdoc.app/) comments. Signatures, parameters and return types live in the JSDoc of the source, not in the knowledge bundle. No API reference site is built from the comments: they are read in the editor and by agents, and the `review-pr` skill checks new and changed code against the conventions below.

### Modules

JSDoc comments for modules must include the module path as title and any `@requires` for the modules it depends on.

A small description should be provided to outline the module's purpose.

```js
/**
## /user/auth

The auth module is required by the XYZ API for request authorization.

A user_sessions{} object is declared in the module to store user sessions.

@requires module:/user/acl
@requires module:/user/fromACL
@requires jsonwebtoken

@module /user/auth
*/
```

### Functions

Comments for functions begin with the `@function` tag. Functions should not be anonymous. `@async` functions should be commented as such.

Each function comment should include an `@description` tag. It is recommended to use a new line for multiline descriptions.

The `@param` tag list should include only params used as function arguments.

Parameter properties should be included if used in the method. Any optional [property] are marked in square brackets.

A global typedef should be created for common Mapp objects.

The `@return` comment tag should state whether a promise is returned which may return an Error object, eg. `@returns {Promise<Object|Error>}`

```js
/**
@function fromACL
@async

@description
Creates a request object for the getUser(request) method argument.
The request.email and request.password are taken from the req.body or authorization header.

@param {Object} req The request object.
@property {string} [req.body.email] The email address of the user.
@property {string} [req.body.password] The password of the user.
@property {string} [req.params.language] The language for the user.
@property {Object} req.headers The request headers.
@property {string} [req.headers.authorization] The authorization header containing the email and password.

@returns {Promise<Object|Error>}
Validated user object or an Error if authentication fails.
*/
```

#### Decorator methods

Decorator methods should always return a typedef.

#### @deprecated methods

Functions no longer in use but kept with a warning for legacy configurations should be marked as `@deprecated`.

```js
/**
@function Style
@deprecated

@description
The deprecated mapp.layer.Style() method will warn if used and return the featureStyle() method which supersedes the Style() method.

@param {Object} layer

@return {Function} featureStyle
*/

function Style(layer) {
  console.warn(
    `The mapp.layer.Style() method has been superseded by the mapp.layer.featureStyle() method.`,
  );
  return featureStyle(layer);
}
```

### @typedef [GLOBAL]

Mapp type object should be defined as global typedefs.

Typedef properties should be defined as typedef using a dash naming convention. eg. The style object property of a `layer` typedef will be defined as `layer-style`, the theme object of a layer-style typedef will be type defined as `layer-style-theme`.

```js
/**
@global
@typedef {Object} layer
A mapp-layer object is a decorated JSON layer object which has been added to a mapview.
@property {boolean} display Whether the layer should be displayed.
@property {layer-style} style The mapp-layer style configuration.
@property {layer-cluster} [cluster] Point layer cluster configuration.
*/
```

### @link

The link tag creates an inline link in the description, which editors resolve on hover.

The link can reference a module and it's inline members like methods. `{@link module:/location/decorate~flyTo}`

### @example

An @example does not require a code block [\`\`\`JS] definition. `@example` tags should be reserved for codepen examples which can be run. Code blocks should be used for code syntax highlighting in the rendered markdown.
