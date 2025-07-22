/**
## /user/cookie

Exports the [user] cookie method for the /api/user/cookie route.

@requires module:/user/acl
@requires module:/user/login
@requires jsonwebtoken
@requires module:/utils/processEnv

@module /user/cookie
*/

import jwt from 'jsonwebtoken';
import acl from './acl.js';
import login from './login.js';

/**
@function cookie
@async

@description
The cookie method attempts to find a request cookie matching the `xyzEnv.TITLE` variable.

The cookie will be destroyed [set to NULL] with detroy request parameter truthy.

The cookie method will use the jsonwebtoken library to verify the existing cookie.

If veriffied successfully a new token with updated user credentials will be signed.

The `xyzEnv.SECRET` variable will be used to sign the token.

The `xyzEnv.COOKIE_TTL` will be set as time to life for the cookie set on the response header.

The token user will be sent back to the client.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} [req.cookies] The request cookies object.
@property {boolean} [req.params.destroy] URL parameter flag whether the cookie should be destroyed.
@property {boolean} [req.params.create] URL parameter flag whether a new cookie should be created.
*/
export default async function cookie(req, res) {
  // acl module will export an empty require object without the ACL being configured.
  if (acl === null) {
    return res.send(null);
  }

  if (req.params.create) {
    return login(req, res);
  }

  const cookie = req.cookies?.[xyzEnv.TITLE];

  if (!cookie) {
    return res.send(false);
  }

  if (req.params.destroy) {
    // Remove cookie.
    res.setHeader(
      'Set-Cookie',
      `${xyzEnv.TITLE}=null;HttpOnly;Max-Age=0;Path=${xyzEnv.DIR || '/'}`,
    );
    return res.send('This too shall pass');
  }

  // Verify current cookie
  jwt.verify(
    cookie,
    xyzEnv.SECRET,
    { algorithm: xyzEnv.SECRET_ALGORITHM },
    async (err, payload) => {
      if (err) {
        return res
          .status(401)
          .setHeader('Content-Type', 'plain/text')
          .send('Invalid token');
      }
      // Get updated user credentials from ACL
      const rows = await acl(
        `
        SELECT email, admin, language, roles, blocked
        FROM acl_schema.acl_table
        WHERE lower(email) = lower($1);`,
        [payload.email],
      );

      if (rows instanceof Error) {
        res.setHeader(
          'Set-Cookie',
          `${xyzEnv.TITLE}=null;HttpOnly;Max-Age=0;Path=${xyzEnv.DIR || '/'}`,
        );
        return res.status(500).send('Failed to retrieve user from ACL');
      }

      const user = rows[0];

      // Admin rights should not be added if not provided from a token.
      user.admin = payload.admin;

      // Assign title identifier to user object.
      user.title = xyzEnv.TITLE;

      if (user.blocked) {
        res.setHeader(
          'Set-Cookie',
          `${xyzEnv.TITLE}=null;HttpOnly;Max-Age=0;Path=${xyzEnv.DIR || '/'}`,
        );
        return res.status(403).send('Account is blocked');
      }

      if (payload.session) {
        user.session = payload.session;
      }

      const token = jwt.sign(user, xyzEnv.SECRET, {
        expiresIn: xyzEnv.COOKIE_TTL,
        algorithm: xyzEnv.SECRET_ALGORITHM,
      });

      const cookie = `${xyzEnv.TITLE}=${token};HttpOnly;Max-Age=${xyzEnv.COOKIE_TTL};Path=${xyzEnv.DIR || '/'};SameSite=Strict${(!req.headers.host.includes('localhost') && ';Secure') || ''}`;

      res.setHeader('Set-Cookie', cookie);

      res.send(user);
    },
  );
}
