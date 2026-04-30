/**
## /user/logout

Exports a default method which destroy the user cookie.

@module /user/logout
*/

/**
@function logout

@param {req} req HTTP request.
@param {res} res HTTP response.
*/
export default function logout(req, res) {
  res.setHeader(
    'Set-Cookie',
    `${xyzEnv.TITLE}=null;HttpOnly;Max-Age=0;Path=${xyzEnv.DIR || '/'}`,
  );
  res.setHeader('location', `${xyzEnv.DIR}/`);
  res.status(302).send();
}
