const registry = {
  apiRoutes: [],
};

export function registerApiRoute(route) {
  if (typeof route?.test !== 'function') {
    throw new TypeError('Extension api route requires a test function.');
  }

  if (typeof route?.handler !== 'function') {
    throw new TypeError('Extension api route requires a handler function.');
  }

  registry.apiRoutes.push(route);
}

export function registerExtension(extension = {}) {
  for (const route of extension.apiRoutes || []) {
    registerApiRoute(route);
  }
}

export function getApiRoutes() {
  return registry.apiRoutes;
}

export function clearExtensions() {
  registry.apiRoutes.length = 0;
}
