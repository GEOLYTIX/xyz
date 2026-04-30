/**
## /user/redirect

@requires jsonwebtoken
@requires module:/user/acl

@module /user/redirect
*/

// biome-ignore assist/source/organizeImports: jsonwebtoken must be imported before the sign method is declared.
import jsonwebtoken from 'jsonwebtoken';
const { sign } = jsonwebtoken;
import acl from './acl.js';

export default async function redirect(req, res, user) {
  if (user.lookup) {
    const rows = await acl(
      `
      SELECT email, admin, language, roles, blocked
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

    Object.assign(user, rows[0]);
  }

  const token = sign(user, xyzEnv.SECRET, {
    expiresIn: xyzEnv.COOKIE_TTL,
    algorithm: xyzEnv.SECRET_ALGORITHM,
  });

  const user_cookie = `${xyzEnv.TITLE}=${token};HttpOnly;Max-Age=${xyzEnv.COOKIE_TTL};Path=${xyzEnv.DIR || '/'};SameSite=Strict${(!req.headers.host.includes('localhost') && ';Secure') || ''}`;

  const redirect = req.cookies?.[`${xyzEnv.TITLE}_redirect`];

  const redirect_cookie = `${xyzEnv.TITLE}_redirect=null;HttpOnly;Max-Age=0;Path=${xyzEnv.DIR || '/'}`;

  const location = redirect ? decodeURIComponent(redirect) : `${xyzEnv.DIR}/`;

  res.setHeader('Set-Cookie', [user_cookie, redirect_cookie]);
  res.setHeader('location', location);
  res.status(302).send();
}
