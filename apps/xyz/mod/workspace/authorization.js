/**
## /workspace/authorization

The authorization module exports the seam through which workspace composition
routes template scope access decisions.

A composing host may register an asynchronous authorization provider to answer
scope decisions from an external policy store, eg. OpenFGA.

The provider is only consulted when the AUTHORIZATION_PROVIDER flag is enabled
in the xyzEnv. Without the flag the authorizeScope method returns the
synchronous checkScope semantics for the user.roles array, matching the
LEGACY_ROLES flag pattern.

@requires /workspace/scopes

@module /workspace/authorization
*/

import { checkScope } from './scopes.js';

/**
@global
@typedef {Object} AuthorizationContext
@property {Array<string>} scope The templateScope chain of the object being composed.
@property {string} scopeKey The joined scope chain. The scopeKey matches the identifiers recorded in workspace.scopes.
@property {Object} obj The object being composed.
@property {array|boolean} [roles] The user roles from request params.
*/

/**
@global
@typedef {Object} AuthorizationProvider
@property {function(AuthorizationContext):Promise<boolean>} checkScope Resolves whether the user has access to the scope.
*/

let provider;

/**
@function setAuthorizationProvider

@description
The method registers an authorization provider for workspace composition. The
provider is only consulted with the AUTHORIZATION_PROVIDER flag enabled in the
xyzEnv.

Calling the method without a provider argument clears the registration.

@param {AuthorizationProvider} [nextProvider] The provider to register.
*/
export function setAuthorizationProvider(nextProvider) {
  provider = nextProvider;
}

/**
@function authorizeScope
@async

@description
The method resolves a scope access decision for workspace composition.

The checkScope semantics for the user.roles array apply unless the
AUTHORIZATION_PROVIDER flag is enabled in the xyzEnv.

With the flag enabled the decision is routed through the registered provider.
The provider must resolve true for the scope access to be granted. A missing
provider or a provider error fails closed and access is denied.

@param {AuthorizationContext} context The scope decision context.
@returns {Promise<boolean>} Whether the user has access to the scope.
*/
export async function authorizeScope(context) {
  if (!xyzEnv.AUTHORIZATION_PROVIDER) {
    return checkScope(context.scope, context.roles);
  }

  try {
    return (await provider?.checkScope(context)) === true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
