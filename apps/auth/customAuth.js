/**
Custom auth route registration for XYZ.
*/

import redirect from '@geolytix/xyz-app/mod/user/redirect.js';

/**
@function custom_login

@description
The method will return a simple HTML form for a username input and submit button.

@param {req} req HTTP request.
@param {res} res HTTP response.
*/
export function custom_login(req, res) {
  const form = `<form method="POST" action="${xyzEnv.DIR}/custom/verify">
    <input type="text" name="username" placeholder="Username" required />
    <button type="submit">Login</button></form>`;

  res.send(form);
}

/**
@function custom_logout

@description
The method will destroy the user cookie and redirect to the base directory.

@param {req} req HTTP request.
@param {res} res HTTP response.
*/
export function custom_logout(req, res) {
  res.setHeader(
    'Set-Cookie',
    `${xyzEnv.TITLE}=null; Max-Age=0; ${xyzEnv.COOKIE_PROPS}`,
  );
  res.setHeader('location', `${xyzEnv.DIR}/`);
  res.status(302).send();
}

/**
@function custom_verify

@description
The method creates a user object with the email property from the request body username and a lookup property set to true.

The user object is passed to the redirect method which will handle the ACL lookup, cookie signing, and response redirection.

@param {req} req HTTP request.
@param {res} res HTTP response.
*/
export function custom_verify(req, res) {
  const user = {
    email: req.body.username,
    lookup: true,
  };
  return redirect(req, res, user);
}
