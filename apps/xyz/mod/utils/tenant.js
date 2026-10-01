// The seam through which a composing host resolves the integer tenant id that a
// row level security DBS connection requires, like setAuthorizationProvider.

let tenantResolver;

// Registers the host's resolver, called with the request; no argument clears it.
export function setTenantResolver(resolver) {
  tenantResolver = resolver;
}

// Fails closed: no resolver, a resolver error or a non-integer id all give undefined,
// which the dbs module refuses for a row level security connection.
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
