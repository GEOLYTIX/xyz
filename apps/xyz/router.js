/**
## /router

Creates an express router object with base xyz endpoints.

@requires express Web application framework
@requires cookie-parser HTTP cookie parsing middleware
@requires express-rate-limit Rate limiting middleware
@requires /utils/processEnv

@module router
*/
import { resolve } from 'node:path';
import cookieParser from 'cookie-parser';
import express from 'express';
import './mod/utils/processEnv.js';
import rateLimit from 'express-rate-limit';
import provider from './mod/provider/_provider.js';
import query from './mod/query.js';
import sign from './mod/sign/_sign.js';
import user from './mod/user/_user.js';
import login from './mod/user/login.js';
import logout from './mod/user/logout.js';
import register from './mod/user/register.js';
import verify from './mod/user/verify.js';
import view from './mod/view.js';
import workspace from './mod/workspace/_workspace.js';

/**
@function createRouter

@description
Creates an express router with xyz base endpoints.

@param {Array<Function>} [middleWare] an optinal array of middleware functions to be run.

@returns {Object} Returns an express router.
**/
function createRouter(middleWare = []) {
  const router = express.Router();

  const publicDir = resolve(xyzEnv.XYZ_CWD || process.cwd(), 'public');

  if (process.versions.node.split('.')[0] < 22) {
    console.warn(`Process Node version below 22.`);
  }

  const limiter = rateLimit({
    legacyHeaders: false,
    limit: xyzEnv.RATE_LIMIT,
    standardHeaders: 'draft-8',
    windowMs: xyzEnv.RATE_LIMIT_WINDOW,
    validate: { xForwardedForHeader: false },
  });

  router.use(limiter);

  router.use(cookieParser());

  const staticOptions = { redirect: false };

  router.use(`${xyzEnv.DIR}/public`, express.static(publicDir, staticOptions));
  router.use(xyzEnv.DIR, express.static(publicDir, staticOptions));

  router.get(`${xyzEnv.DIR}/api/provider{/:provider}`, middleWare, provider);

  router.post(
    `${xyzEnv.DIR}/api/provider{/:provider}`,
    express.json({ limit: '5mb' }),
    middleWare,
    provider,
  );

  router.get(`${xyzEnv.DIR}/api/sign{/:signer}`, middleWare, sign);

  router.get(`${xyzEnv.DIR}/api/query{/:template}`, middleWare, query);
  router.post(
    `${xyzEnv.DIR}/api/query{/:template}`,
    express.json({ limit: '5mb' }),
    middleWare,
    query,
  );

  router.get(`${xyzEnv.DIR}/api/workspace{/:key}`, middleWare, workspace);

  router.get(`${xyzEnv.DIR}/api/user/login`, login);
  router.post(
    `${xyzEnv.DIR}/api/user/login`,
    [express.urlencoded({ extended: true }), express.json({ limit: '5mb' })],
    login,
  );

  router.get(`${xyzEnv.DIR}/api/user/logout`, logout);

  router.get(`${xyzEnv.DIR}/api/user/register`, register);
  router.post(
    `${xyzEnv.DIR}/api/user/register`,
    [express.urlencoded({ extended: true }), express.json({ limit: '5mb' })],
    register,
  );

  router.get(`${xyzEnv.DIR}/api/user/verify`, verify);

  router.get(`${xyzEnv.DIR}/api/user{/:method}{/:key}`, middleWare, user);

  router.post(
    `${xyzEnv.DIR}/api/user{/:method}`,
    [express.urlencoded({ extended: true }), express.json({ limit: '5mb' })],
    middleWare,
    user,
  );

  router.get(`${xyzEnv.DIR}/view{/:template}`, middleWare, view);

  router.get(`${xyzEnv.DIR}/`, middleWare, view);

  router.get(`/`, middleWare, view);

  return router;
}

export default createRouter;
