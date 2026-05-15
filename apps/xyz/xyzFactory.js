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
@requires /utils/processEnv
*/

import { resolve } from "node:path";
import "./mod/utils/processEnv.js";
import cookieParser from "cookie-parser";
import express from "express";
import rateLimit from "express-rate-limit";
import validateRequestAuth from "./mod/middleware/validateRequestAuth.js";
import validateRequestParams from "./mod/middleware/validateRequestParams.js";

import provider from "./mod/provider/_provider.js";
import query from "./mod/query.js";
import sign from "./mod/sign/_sign.js";
import user from "./mod/user/_user.js";
import view from "./mod/view.js";
import workspace from "./mod/workspace/_workspace.js";

const publicDir = resolve(xyzEnv.XYZ_CWD || process.cwd(), "public");

if (process.versions.node.split(".")[0] < 22) {
  console.warn(`Process Node version below 22.`);
}

const limiter = rateLimit({
  legacyHeaders: false,
  limit: xyzEnv.RATE_LIMIT,
  standardHeaders: "draft-8",
  windowMs: xyzEnv.RATE_LIMIT_WINDOW,
  validate: { xForwardedForHeader: false },
});

export const createXyzMiddleware = (middleware) => {
  const router = express.Router();

  router.use(limiter);
  router.use(cookieParser());
  router.use(validateRequestParams);
  router.use(middleware);

  // redirect if dir is missing in url path.
  router.use((req, res, next) => {
    if (/(?<=\/.well-known\/appspecific)/.test(req.url)) {
      return;
    }

    if (xyzEnv.DIR && req.url.length === 1) {
      res.setHeader("location", `${xyzEnv.DIR}`);
      return res.status(302).send();
    }
    next();
  });

  router.use(`${xyzEnv.DIR}/public`, express.static(publicDir));
  router.use(xyzEnv.DIR, express.static(publicDir));

  router.get(`${xyzEnv.DIR}/api/provider{/:provider}`, provider);

  router.post(
    `${xyzEnv.DIR}/api/provider{/:provider}`,
    express.json({ limit: "5mb" }),
    provider,
  );

  router.get(`${xyzEnv.DIR}/api/sign{/:signer}`, sign);

  router.get(`${xyzEnv.DIR}/api/query{/:template}`, query);

  router.post(
    `${xyzEnv.DIR}/api/query{/:template}`,
    express.json({ limit: "5mb" }),
    query,
  );

  router.get(`${xyzEnv.DIR}/api/workspace{/:key}`, workspace);

  router.get(`${xyzEnv.DIR}/api/user{/:method}{/:key}`, user);

  router.post(
    `${xyzEnv.DIR}/api/user{/:method}`,
    [express.urlencoded({ extended: true }), express.json({ limit: "5mb" })],
    user,
  );

  router.get(`${xyzEnv.DIR}/view{/:template}`, view);

  router.get(`${xyzEnv.DIR}/`, view);
};

const app = express();
app.disable("x-powered-by");

const xyz = createXyzMiddleware([validateRequestAuth]);
app.use(xyz);

if (!process.env.VERCEL) {
  app.listen(xyzEnv.PORT);
}

export default app;
