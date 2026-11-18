/**
## /middleware/cors

Adds Cross-Origin Resource Sharing (CORS) headers to responses for the origins listed in the comma separated CORS_ORIGINS xyzEnv. The middleware does nothing if CORS_ORIGINS is not configured.

A `*` entry allows any origin. Credentials are never allowed: the Access-Control-Allow-Credentials header is not set, and the XYZ user cookie is SameSite=Strict by default so it is not sent with cross-site requests. Without a token a cross-origin request is served with the access rights of an anonymous user, so CORS is mainly useful for PUBLIC instances or public resources such as the MAPP library bundle.

Token authentication is intentionally allowed cross-origin. A request which explicitly provides a token, as an Authorization header or a `token` param, is authenticated as the owner of the token. This grants nothing beyond what the holder of the token already has outside a browser.

Every response gets `Vary: Origin` while CORS_ORIGINS is configured, so that a shared cache does not serve a response without the CORS headers to an allowed origin.

Preflight OPTIONS requests from an allowed origin are answered with 204 No Content.

```env
CORS_ORIGINS=https://cdpn.io,https://codepen.io
```

@module /middleware/cors
*/

/**
@function cors

@description
Sets the Access-Control-Allow-Origin header if the request origin is in the CORS_ORIGINS list.

@param {req} req HTTP request.
@param {res} res HTTP response.
@param {Function} next Express next function.
*/
export default function cors(req, res, next) {
  const origins = xyzEnv.CORS_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (!origins?.length) return next();

  // The response depends on the Origin header whenever CORS is configured.
  // res.vary appends to an existing Vary header.
  res.vary('Origin');

  const origin = req.headers.origin;

  if (!origin) return next();

  if (origins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    return next();
  }

  if (
    req.method === 'OPTIONS' &&
    req.headers['access-control-request-method']
  ) {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      req.headers['access-control-request-headers'] || 'Content-Type',
    );
    res.setHeader('Access-Control-Max-Age', '600');
    return res.status(204).end();
  }

  next();
}
