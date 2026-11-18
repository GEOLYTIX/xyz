/**
## /middleware/cors

Adds Cross-Origin Resource Sharing (CORS) headers to responses for the origins listed in the comma separated CORS_ORIGINS xyzEnv. The middleware does nothing if CORS_ORIGINS is not configured.

A `*` entry allows any origin. Credentials are never allowed. A cross-origin request is not sent with the XYZ user cookie, so it is served with the access rights of an anonymous user. CORS is only useful for PUBLIC instances or public resources such as the MAPP library bundle.

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

  const origin = req.headers.origin;

  if (!origins?.length || !origin) return next();

  if (origins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.vary('Origin');
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
