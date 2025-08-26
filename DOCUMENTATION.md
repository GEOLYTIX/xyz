# DOCUMENTATION

This document provides an overview of the different documentation sources to support the XYZ/MAPP project.

## README

The [README.md](https://github.com/GEOLYTIX/xyz/blob/main/README.md) document for the xyz repository landing page is the primary entry point to provide an overview of the project.

Supporting documents for the project [LICENCE](https://github.com/GEOLYTIX/xyz/blob/main/LICENSE), in regards to [CONTRIBUTING](https://github.com/GEOLYTIX/xyz/blob/main/CONTRIBUTING.md) to the project, [DEVELOPING](https://github.com/GEOLYTIX/xyz/blob/main/DEVELOPING.md), and our [CODE_OF_CONDUCT](https://github.com/GEOLYTIX/xyz/blob/main/CODE_OF_CONDUCT.md) can be found alongside this document in the XYZ repository root directory.

## WIKI

The [XYZ repository wiki](https://github.com/GEOLYTIX/xyz/wiki) is intended as a place for workshops, getting started guidelines, process environment and workspace configuration references.

## JSDOCS

XYZ/MAPP source code is annotated via [JSDoc](https://jsdoc.app/) markup language.

We are using the [clean-jsdoc-theme](https://github.com/ankitskvmdam/clean-jsdoc-theme-example) which is installed as one of the devDependencies.

The script to build the docs requires the jsdoc_mapp.json and jsdoc_xyz.json config files in the root directory. The script can be executed with `pnpm generate-docs`.

The documentation pages are generated in the local `/docs` directory. The docs directory is [git] ignored will be built in an automated action.

The built documentation pages can be accessed via the repositories github pages.

<https://geolytix.github.io/xyz/>

MAPP library modules are accessed through <https://geolytix.github.io/xyz/mapp/>

### Modules

JSDoc comments for modules must include the module path as title and any `@requires` linking the page to other pages in the docs directory.

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
The deprectaed mapp.layer.Style() method will warn if use and return the featureStyle() method which supersedes the Style() method.

@param {Object} layer

@return {Function} featureStyle
*/

function Style(layer) {
  console.warn(
    `The mapp.layer.Style() method has been superseeded by the mapp.layer.featureStyle() method.`,
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

The link tag creates an inline link element which can be used to create a link inline the description.

The link can reference a module and it's inline members like methods. `{@link module:/location/decorate~flyTo}`

### @example

An @example does not require a code block [\`\`\`JS] definition. At examples should be reserved for codepen examples which can be run. Code blocks should be used for code syntax highlighting in the rendered markdown.

### /docs express route

The /docs express route can be used to preview the built pages on `http://localhost:3000/xyz/` or `http://localhost:3000/xyz/`

### docs in vscode

- Docs can also be previewed right in vsdocs by right clicking on any .html page in the docs directory. This will provide a live working preview of the docs in the editor.
- You will need an extension written by microsoft called [Live Preview](https://marketplace.visualstudio.com/items?itemName=ms-vscode.live-server)
