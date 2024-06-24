# DOCUMENTATION

This document provides an overview of the different documentation sources to support the XYZ/MAPP project.

## README

The [README.md](https://github.com/GEOLYTIX/xyz/blob/main/README.md) document for the xyz repository landing page is the primary entry point to provide an overview of the project.

Supporting documents for the project [LICENCE](https://github.com/GEOLYTIX/xyz/blob/main/LICENSE), in regards to [CONTRIBUTING](https://github.com/GEOLYTIX/xyz/blob/main/CONTRIBUTING.md) to the project,[DEVELOPING](https://github.com/GEOLYTIX/xyz/blob/main/DEVELOPING.md), and our [CODE_OF_CONDUCT](https://github.com/GEOLYTIX/xyz/blob/main/CODE_OF_CONDUCT.md) can be found alongside this document in the XYZ repository root directory.

## WIKI

The [XYZ repository wiki](https://github.com/GEOLYTIX/xyz/wiki) is intended as a place for workshops, getting started guidelines, process environment and workspace configuration references.

## JSDOCS

XYZ/MAPP source code is annotated via JSDoc markup language.

We are using the [clean-jsdoc-theme](https://github.com/ankitskvmdam/clean-jsdoc-theme-example) which is installed as one of the devDependencies.

The script to build the docs requires the jsdoc_mapp.json and jsdoc_xyz.json config files in the root directory. The script can be executed with `npm run generate-docs`.

The documentation pages are generated in the local `/docs` directory. The docs directory is [git] ignored will be built in an automated action.

The built documentation pages can be accessed via the repositories github pages.

https://geolytix.github.io/xyz/

MAPP library modules are accessed through https://geolytix.github.io/xyz/mapp/

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

The `@param` tag list should incluide nested params only if these are required or optional in the commented function itself. An optional [param] is marked in square brackets.

The `@return` comment tag should state whether a promise is returned which may return an Error object, eg. `@returns {Promise<Object|Error>}`

```js
/**
@function fromACL
@async

@description
Creates a request object for the getUser(request) method argument.
The request.email and request.password are taken from the req.body or authorization header.

@param {Object} req The request object.
@param {string} [req.body.email] The email address of the user.
@param {string} [req.body.password] The password of the user.
@param {string} [req.params.language] The language for the user.
@param {Object} req.headers The request headers.
@param {string} [req.headers.authorization] The authorization header containing the email and password.

@returns {Promise<Object|Error>}
Validated user object or an Error if authentication fails.
*/
```

### /docs express route

The /docs express route can be used to preview the built pages on `http://localhost:3000/docs/`