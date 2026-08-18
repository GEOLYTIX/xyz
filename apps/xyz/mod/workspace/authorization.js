/**
## /workspace/authorization

The authorization module exports the seam through which workspace composition routes template scope access decisions.

A composing host may register asynchronous authorization providers to answer scope decisions from an external policy store, eg. OpenFGA. Each provider is registered with a key.

A provider is only consulted for a user with a matching authorization_provider property. Without the property the authorizeScope method returns the synchronous checkScope semantics for the user.roles array.

@requires /workspace/scopes

@module /workspace/authorization
*/

import { checkScope } from './scopes.js';

/**
@global
@typedef {Object} User
@property {Array<string>|boolean} [user.roles] The user roles.
@property {string} [user.authorization_provider] The key of the authorization provider which decides scope access for the user.
*/

/**
@global
@typedef {Object} AuthorizationContext
@property {Array<string>} scope The templateScope chain of the object being composed.
@property {string} scopeKey The joined scope chain. The scopeKey matches the identifiers recorded in workspace.scopes.
@property {Object} obj The object being composed.
@property {User} [user] The requesting user from request params.

*/

/**
@global
@typedef {Object} AuthorizationProvider
@property {function(AuthorizationContext):Promise<boolean>} checkScope Resolves whether the user has access to the scope.
*/

const providers = new Map();

/**
@function setAuthorizationProvider

@description
The method registers an authorization provider for workspace composition. The provider is only consulted for a user with an authorization_provider property matching the key.

Calling the method without a provider argument clears the registration for the key.

@param {string} key The provider key matched against the user.authorization_provider property.
@param {AuthorizationProvider} [provider] The provider to register.
*/
export function setAuthorizationProvider(key, provider) {
  if (provider === undefined) {
    providers.delete(key);
    return;
  }

  providers.set(key, provider);
}

/**
@function authorizeScope
@async

@description
The method resolves a scope access decision for workspace composition.

The checkScope semantics for the user.roles array apply unless the user has an
authorization_provider property.

With the property the decision is routed through the provider registered for
the user.authorization_provider key. The provider must resolve true for the
scope access to be granted. A missing provider or a provider error fails closed
and access is denied.

@param {AuthorizationContext} context The scope decision context.
@returns {Promise<boolean>} Whether the user has access to the scope.
*/
export async function authorizeScope(context) {
  const providerKey = context.user?.authorization_provider;

  if (!providerKey) {
    return checkScope(context.scope, context.user?.roles);
  }

  try {
    return (await providers.get(providerKey)?.checkScope(context)) === true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
