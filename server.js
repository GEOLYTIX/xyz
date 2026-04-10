import { registerExtension } from '@geolytix/xyz-app/extensions';

registerExtension({
  apiRoutes: [
    // Add fork-specific API routes here.
    // {
    //   test: (req) => /\/api\/custom/.test(req.url),
    //   handler: (req, res) => res.status(200).json({ ok: true }),
    // },
  ],
});

import app from '@geolytix/xyz-app/server';

export default app;
