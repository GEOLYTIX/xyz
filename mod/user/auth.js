/**
## /user/auth

The auth module is required by the XYZ API for request authorization.

A user_sessions{} object is declared in the module to store user sessions.

@requires module:/user/acl
@requires module:/user/fromACL
@requires jsonwebtoken
@requires module:/utils/processEnv

@module /user/auth
*/

import jwt from 'jsonwebtoken';
import acl from './acl.js';
import fromACL from './fromACL.js';

const user_sessions = {};

/**
@function auth
@async

@description
The auth method returns a user object to be assigned as request parameter if a request is successfully authenticated.

Requests with authorization headers will return the user fromACL method.

Without a request parameter token [eg. API key], the token value will be extracted from a request cookie matching the TITLE xyzEnvironment variable.

The token will be verified by the JWT [jsonwebtoken] library.

With a valid signature the token will be resolved as a user object by the verify method.

The auth method checks either the request parameter token or user.session if enabled.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.headers Request headers.
@property {Object} [headers.authorization] User authorization object.
@property {Object} req.params Request parameters.
@property {string} [params.token] JWT.
@property {Object} [req.cookies] Request cookies.

@returns {Promise<Object|Error>} Method resolves to either a user object or Error
*/
export default async function auth(req, res) {
  if (acl === null) return null;

  if (req.headers.authorization) {
    return await fromACL(req);
  }

  // Get token from params or cookie.
  const token = req.params.token || req.cookies?.[xyzEnv.TITLE];

  // Return if there is no token to decode
  if (!token) return null;

  // Verify the token signature.
  let user;

  // A secret string is required to verify a token.
  if (!xyzEnv.SECRET) return null;

  try {
    user = jwt.verify(token, xyzEnv.SECRET, {
      algorithm: xyzEnv.SECRET_ALGORITHM,
    });
  } catch (err) {
    return err;
  }

  // Check req.param.token
  const tokenCheck = await checkParamToken(req, res, user);

  if (tokenCheck instanceof Error) {
    // The token check has failed.
    return tokenCheck;
  }

  // Check user.session
  const sessionCheck = await checkSession(req, user);

  if (sessionCheck instanceof Error) {
    // The session check has failed.
    return sessionCheck;
  }

  if (Array.isArray(user.roles)) {
    // Add default role * to all users.
    user.roles.push('*');

    // Shift first role of dot notation roles into user.roles array.
    user.roles.forEach((role) => {
      const dotRoles = role.split('.');
      if (dotRoles.length > 1) {
        user.roles.push(dotRoles.shift());
      }
    });
  }

  return user;
}

/**
@function checkParamToken
@async

@description
An API key can be provided as a request parameter token.

API key access does not have admin rights.

Every request will validate the API key against the key stored in the ACL.

API keys do not expire. But changing the key in the ACL will immediately invalidate the key on successive checks.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params Request parameters.
@property {string} params.token JWT.
@property {Object} [req.cookies] Request cookies.

@returns {Promise<Object|Error>} Method resolves to either a user object or Error
*/

async function checkParamToken(req, res, user) {
  // A parameter token is required to be checked.
  if (!req.params.token) return;

  // The user object has an API key.
  if (user.api) {
    // Retrieve stored API key from ACL.
    const rows = await acl(
      `
      SELECT api, blocked
      FROM acl_schema.acl_table
      WHERE lower(email) = lower($1);`,
      [user.email],
    );

    // The request for the stored API key has failed.
    if (rows instanceof Error) return rows;

    if (rows.blocked) {
      // The user is blocked.
      return new Error('Account is blocked');
    }

    if (rows[0].api !== req.params.token) {
      // API keys do not expire.
      // The stored key must match the request param token.
      return new Error('API Key mismatch');
    }
  }

  // Token access must not have admin rights.
  delete user.admin;

  // Flag the user to be created from a token.
  // It must not be possible created a new token from a token user.
  user.from_token = true;

  // Check whether the token matches cookie.
  if (req.cookies?.[xyzEnv.TITLE] !== req.params.token) {
    // Create and assign a new cookie for the user.
    const cookie = jwt.sign(user, xyzEnv.SECRET, {
      algorithm: xyzEnv.SECRET_ALGORITHM,
    });

    res.setHeader(
      'Set-Cookie',
      `${xyzEnv.TITLE}=${cookie};HttpOnly;Max-Age=${(user.exp && user.exp - user.iat) || xyzEnv.COOKIE_TTL};Path=${xyzEnv.DIR || '/'};SameSite=Strict${(!req.headers.host?.includes('localhost') && ';Secure') || ''}`,
    );
  }
}

/**
@function checkSession
@async

@description
Will return if sessions are not enabled via USER_SESSION xyzEnvironment variable.

A user must have a session key which is either stored in the user_sessions object or will be validated against the session key in the ACL.

Validated session keys are stored in the user_sessions object to prevent excessive requests to the ACL for the same user from the same process.

The session key will be updated on login, eg. on a different device. This will invalidate the existing session key on devices previously logged in.

@param {req} req HTTP request.
@param {user} user User object.
@property {Object} req.params Request parameters.
@property {string} [params.token] JWT.

@returns {Promise<Object|Error>} Method resolves to either a user object or Error
*/

async function checkSession(req, user) {
  // Session checks are not applicable for requests with token.
  if (req.params.token) return;

  // USER_SESSION has not been enabled.
  if (!xyzEnv.USER_SESSION) return;

  // A user.session must be provided if enabled.
  if (!user.session) {
    return new Error('No user.session provided.');
  }

  // The session token is stored in the user_session object.
  if (Object.hasOwn(user_sessions, user.email)) {
    // The stored session doesn't match the token user session.
    if (user_sessions[user.email] !== user.session) {
      // Delete the user_session
      delete user_sessions[user.email];
    }
  }

  if (!Object.hasOwn(user_sessions, user.email)) {
    // Get session from the ACL.
    const rows = await acl(
      `
      SELECT session
      FROM acl_schema.acl_table
      WHERE lower(email) = lower($1);`,
      [user.email],
    );

    // The request for the stored session has failed.
    if (rows instanceof Error) return rows;

    if (user.session !== rows[0].session) {
      // The stored session doesn't match user.session.
      return new Error('Session has been terminated. Please login again.');
    }

    // Store user.session in user_sessions object.
    user_sessions[user.email] = user.session;
  }
}
