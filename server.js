/**
The root backend composes the base XYZ app with optional extensions.

SAML is registered here as a concrete example of an extracted backend app that
adds its own direct HTTP routes back into the shared Express server.
*/

import { registerExtension } from '@geolytix/xyz-app/extensions';
import samlExtension from '@geolytix/xyz-saml-app';

registerExtension({
  expressRoutes: samlExtension.expressRoutes,
  apiRoutes: [
    // Add fork-specific API routes here.
    // {
    //   test: (req) => /\/api\/custom/.test(req.url),
    //   handler: (req, res) => res.status(200).json({ ok: true }),
    // },
  ],
});

// Load the base server after extension registration so direct routes are mounted.
const { default: app } = await import('@geolytix/xyz-app/server');

export default app;
