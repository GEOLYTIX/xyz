/**
## /utils/tenant
The tenant module exports the seam through which a composing host resolves the integer tenant id a row level security DBS connection requires.

@module /utils/tenant
*/

let tenantResolver;

/**
@function setTenantResolver

@description
The method registers the host's tenant resolver, like setAuthorizationProvider registers an authorization provider.
Calling the method without a resolver argument clears the registration.

@param {function(req):Promise<number|undefined>} [resolver] Resolves the integer tenant id for a request.
*/
export function setTenantResolver(resolver) {
  tenantResolver = resolver;
}

/**
@function resolveTenantId
@async

@description
The method resolves the integer tenant id for the request from the registered resolver.
It fails closed: no resolver, a resolver error or a tenant id which is not an integer all return undefined, which a row level security connection refuses.

@param {req} req HTTP request.
@returns {Promise<number|undefined>} The integer tenant id.
*/
export async function resolveTenantId(req) {
  if (typeof tenantResolver !== 'function') return;

  try {
    const tenant_id = await tenantResolver(req);

    if (!Number.isInteger(tenant_id)) return;

    return tenant_id;
  } catch (err) {
    console.error(err);
  }
}
