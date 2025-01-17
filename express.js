/**
@module express-server
@description

# Express.js 🚅

Express is a minimal and flexible Node.js web application framework that provides a robust
set of features for web and mobile applications.

Our implementation provides the following endpoints and features:

- SAML authentication endpoints for Single Sign-On
- Rate-limited API endpoints for provider interactions
- Static file serving for documentation
- Security enhancements including header protection

The server implements the following core features:

- Rate limiting: 500 requests per 15 minutes per IP
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
RATE_LIMIT - Maximum requests per window (default: 500)
RATE_LIMIT_WINDOW - Time window in ms (default: 15 minutes)
```
@requires dotenv - Environment configuration loading
@requires express - Web application framework
@requires cookie-parser - HTTP cookie parsing middleware
@requires express-rate-limit - Rate limiting middleware
*/

require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const app = express();

app.disable('x-powered-by');

const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW ?? 1 * 60 * 1000, // 1 minute
  limit: process.env.RATE_LIMIT ?? 1000, //1000 requests per 15min
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

app.use(limiter);

app.use(
  '/xyz',
  express.static('docs', {
    extensions: ['html'],
  }),
);

app.use(`${process.env.DIR || ''}/public`, express.static('public'));

app.use(process.env.DIR || '', express.static('public'));

app.use(`${process.env.DIR || ''}/tests`, express.static('tests'));

app.use(process.env.DIR || '', express.static('tests'));

app.use(cookieParser());

const api = require('./api/api');

app.get(`${process.env.DIR || ''}/api/provider/:provider?`, api);

app.post(
  `${process.env.DIR || ''}/api/provider/:provider?`,
  express.json({ limit: '5mb' }),
  api,
);

app.get(`${process.env.DIR || ''}/api/sign/:provider?`, api);

app.post(
  `${process.env.DIR || ''}/api/sign/:provider?`,
  express.json({ limit: '5mb' }),
  api,
);

app.get(`${process.env.DIR || ''}/api/query/:template?`, api);

app.post(
  `${process.env.DIR || ''}/api/query/:template?`,
  express.json({ limit: '5mb' }),
  api,
);

app.get(`${process.env.DIR || ''}/api/fetch/:template?`, api);

app.post(
  `${process.env.DIR || ''}/api/fetch/:template?`,
  express.json({ limit: '5mb' }),
  api,
);

app.get(`${process.env.DIR || ''}/api/workspace/:key?`, api);

app.get(`${process.env.DIR || ''}/api/user/:method?/:key?`, api);

app.post(
  `${process.env.DIR || ''}/api/user/:method?`,
  [express.urlencoded({ extended: true }), express.json({ limit: '5mb' })],
  api,
);

app.get(`${process.env.DIR || ''}/saml/metadata`, api);

app.get(`${process.env.DIR || ''}/saml/logout`, api);

app.get(`${process.env.DIR || ''}/saml/login`, api);

app.post(
  `${process.env.DIR || ''}/saml/acs`,
  express.urlencoded({ extended: true }),
  api,
);

app.get(`${process.env.DIR || ''}/view/:template?`, api);

app.get(`${process.env.DIR || ''}/:locale?`, api);

process.env.DIR && app.get(`/`, api);

app.listen(process.env.PORT || 3000);
