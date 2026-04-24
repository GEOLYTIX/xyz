/**
@module express
@description

# express.js 🚅

[Express](https://expressjs.com) is a minimal and flexible Node.js web application framework that provides a robust
set of features for web and mobile applications.

Our implementation provides the following endpoints and features:

- Rate-limited API endpoints for provider interactions
- Static file serving for documentation
- Security enhancements including header protection

The server implements the following core features:

- Rate limiting: 1000 requests per 1 min per IP
- Cookie parsing for session management
- JSON body parsing with 5MB limit for POST requests
- Static file serving with HTML extension support

## Security 🔐

- X-Powered-By header disabled
- Rate limiting enabled
- SAML authentication required for protected routes

## env

```env
PORT - Server port (default: 3000)
DIR - Base directory for routes
RATE_LIMIT - Maximum requests per window (default: 1000)
RATE_LIMIT_WINDOW - Time window in ms (default: 1 min)
```
@requires express Web application framework
@requires cookie-parser HTTP cookie parsing middleware
@requires express-rate-limit Rate limiting middleware
*/

import { resolve } from 'node:path';
import './mod/utils/processEnv.js';
import cookieParser from 'cookie-parser';
import express from 'express';
import rateLimit from 'express-rate-limit';
import api from './api.js';

const publicDir = resolve(xyzEnv.XYZ_CWD || process.cwd(), 'public');

if (process.versions.node.split('.')[0] < 22) {
  console.warn(`Process Node version below 22.`);
}

const app = express();

app.disable('x-powered-by');

const limiter = rateLimit({
  legacyHeaders: false,
  limit: xyzEnv.RATE_LIMIT,
  standardHeaders: 'draft-8',
  windowMs: xyzEnv.RATE_LIMIT_WINDOW,
  validate: { xForwardedForHeader: false },
});

app.use(limiter);

// redirect if dir is missing in url path.
app.use((req, res, next) => {
  if (xyzEnv.DIR && req.url.length === 1) {
    res.setHeader('location', `${xyzEnv.DIR}`);
    return res.status(302).send();
  }
  next();
});

app.use(cookieParser());

app.use(`${xyzEnv.DIR}/public`, express.static(publicDir));

app.use(xyzEnv.DIR, express.static(publicDir));

app.get(`${xyzEnv.DIR}/api/provider{/:provider}`, api);

app.post(
  `${xyzEnv.DIR}/api/provider{/:provider}`,
  express.json({ limit: '5mb' }),
  api,
);

app.get(`${xyzEnv.DIR || ''}/api/sign{/:signer}`, api);

app.get(`${xyzEnv.DIR}/api/query{/:template}`, api);

app.post(
  `${xyzEnv.DIR}/api/query{/:template}`,
  express.json({ limit: '5mb' }),
  api,
);

app.get(`${xyzEnv.DIR}/api/workspace{/:key}`, api);

app.get(`${xyzEnv.DIR}/api/user{/:method}{/:key}`, api);

app.post(
  `${xyzEnv.DIR}/api/user{/:method}`,
  [express.urlencoded({ extended: true }), express.json({ limit: '5mb' })],
  api,
);

app.get(`${xyzEnv.DIR}/view{/:template}`, api);

app.get(`${xyzEnv.DIR}{/:locale}`, api);

app.get(`/`, api);

if (!process.env.VERCEL) {
  app.listen(xyzEnv.PORT);
}

export default app;
