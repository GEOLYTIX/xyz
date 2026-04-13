/**
@module extensions
@description

Extension registry for the base XYZ app.

Two extension surfaces are supported:

- `apiRoutes`: handlers that participate in the internal XYZ API router.
- `expressRoutes`: functions that mount direct HTTP routes on the Express app.

The `expressRoutes` hook exists for features such as SAML that need their own
route definitions or body parsing middleware before a request reaches `api.js`.
*/

const registry = {
  apiRoutes: [],
  expressRoutes: [],
};

/**
@function registerApiRoute
@param {{ test: Function, handler: Function }} route
Registers a route for the internal API dispatcher used by `api.js`.
*/
export function registerApiRoute(route) {
  if (typeof route?.test !== 'function') {
    throw new TypeError('Extension api route requires a test function.');
  }

  if (typeof route?.handler !== 'function') {
    throw new TypeError('Extension api route requires a handler function.');
  }

  registry.apiRoutes.push(route);
}

/**
@function registerExtension
@param {{ apiRoutes?: Array, expressRoutes?: Array }} extension
Registers all routes exposed by an extension package.
*/
export function registerExtension(extension = {}) {
  for (const route of extension.apiRoutes || []) {
    registerApiRoute(route);
  }

  for (const route of extension.expressRoutes || []) {
    registerExpressRoute(route);
  }
}

/**
@function getApiRoutes
@returns {Array}
Returns all registered API-level extension routes.
*/
export function getApiRoutes() {
  return registry.apiRoutes;
}

/**
@function registerExpressRoute
@param {Function} route
Registers a function that receives the Express app and mounts direct routes.
*/
export function registerExpressRoute(route) {
  if (typeof route !== 'function') {
    throw new TypeError('Extension express route requires a function.');
  }

  registry.expressRoutes.push(route);
}

/**
@function getExpressRoutes
@returns {Array<Function>}
Returns all registered server-level route installers.
*/
export function getExpressRoutes() {
  return registry.expressRoutes;
}

/**
@function clearExtensions
Clears the extension registry. Intended for tests.
*/
export function clearExtensions() {
  registry.apiRoutes.length = 0;
  registry.expressRoutes.length = 0;
}
