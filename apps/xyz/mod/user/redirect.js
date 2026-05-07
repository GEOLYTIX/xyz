/**
## /user/redirect

The module exports the default redirect method called from the default or a custom user authentication method.

@requires jsonwebtoken
@requires module:/user/acl

@module /user/redirect
*/

// biome-ignore assist/source/organizeImports: jsonwebtoken must be imported before the sign method is declared.
import jsonwebtoken from 'jsonwebtoken';
const { sign } = jsonwebtoken;
import acl from './acl.js';

/**
@function redirect

@description
A user object from the acl module is performed with the lookup property flag in the provided user param.

A user cookie is signed with the jsonwebtoken library and set on the response header.

The method checks for a redirect location on a `_redirect` cookie and sets the location header to the redirect location or the base directory if no redirect cookie is found.

The redirect cookie is destroyed [set to NULL] with the response header.

The response is sent with a 302 status code to redirect the client to the location header URL.

@param {req} req HTTP request.
@param {res} res HTTP response.
@param {object} user The user object should contain an email property and optionally a lookup property which will trigger a lookup in the ACL for the user email to assign any additional properties from the ACL to the user object before signing the cookie.
@property {string} user.email The email property is required to lookup the user in the ACL and assign any additional properties to the user object before signing the cookie.
@property {boolean} [user.lookup] The lookup property flag will trigger a lookup in the ACL for the user email to assign any additional properties to the user object before signing the cookie.
*/
export default async function redirect(req, res, user) {
  if (user.lookup) {
    if (acl === null) {
      return res.status(405).send('ACL unavailable.');
    }

    const rows = await acl(
      `
      SELECT email, admin, language, roles, blocked, approved, verified
      FROM acl_schema.acl_table
      WHERE lower(email) = lower($1);`,
      [user.email],
    );

    if (rows instanceof Error) {
      res.setHeader(
        'Set-Cookie',
        `${xyzEnv.TITLE}=null;HttpOnly;Max-Age=0;Path=${xyzEnv.DIR || '/'}`,
      );
      return res.status(500).send('Failed to retrieve user from ACL');
    }

    if (!rows[0]) {
      return res.status(401).send('User not found.');
    }

    if (rows[0].blocked) {
      res.setHeader(
        'Set-Cookie',
        `${xyzEnv.TITLE}=null;HttpOnly;Max-Age=0;Path=${xyzEnv.DIR || '/'}`,
      );
      return res.status(403).send('User blocked in ACL.');
    }

    if (rows[0].verified === false) {
      return res.status(401).send('User not verified in ACL.');
    }

    if (rows[0].approved === false) {
      return res.status(401).send('User not approved in ACL.');
    }

    Object.assign(user, rows[0]);
  }

  const token = sign(user, xyzEnv.SECRET, {
    expiresIn: xyzEnv.COOKIE_TTL,
    algorithm: xyzEnv.SECRET_ALGORITHM,
  });

  const user_cookie = `${xyzEnv.TITLE}=${token};HttpOnly;Max-Age=${xyzEnv.COOKIE_TTL};Path=${xyzEnv.DIR || '/'};SameSite=Strict${(!req.headers.host.includes('localhost') && ';Secure') || ''}`;

  const redirect = req.cookies?.[`${xyzEnv.TITLE}_redirect`];

  const redirect_cookie = `${xyzEnv.TITLE}_redirect=null;HttpOnly;Max-Age=0;Path=${xyzEnv.DIR || '/'}`;

  const location = redirectLocation(redirect);

  res.setHeader('Set-Cookie', [user_cookie, redirect_cookie]);
  res.setHeader('location', location);
  res.status(302).send();
}

function redirectLocation(redirect) {
  if (!redirect) return `${xyzEnv.DIR}/`;

  try {
    const location = decodeURIComponent(redirect).replaceAll(/[;\r\n]/g, '');

    if (location.startsWith('/') && !location.startsWith('//')) {
      return location;
    }
  } catch {
    // Fall through to the safe default for malformed cookie values.
  }

  return `${xyzEnv.DIR}/`;
}
