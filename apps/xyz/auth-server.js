/**
The auth-server script imports the xyz app and extends the routes with custom/login, custom/logout, and custom/verify routes.
*/

import '@geolytix/xyz-app/mod/utils/processEnv.js';
import redirect from '@geolytix/xyz-app/mod/user/redirect.js';
import express from 'express';
import app from './server.js';

app.get(`${xyzEnv.DIR}/custom/login`, custom_login);
app.post(
  `${xyzEnv.DIR}/custom/verify`,
  [express.urlencoded({ extended: true }), express.json({ limit: '5mb' })],
  custom_verify,
);

export default app;
/**
@function custom_login

@description
The method will return a simple HTML form for a username input and submit button.

@param {req} req HTTP request.
@param {res} res HTTP response.
*/
function custom_login(req, res) {
  const form = `<form method="POST" action="${xyzEnv.DIR}/custom/verify">
    <input type="text" name="username" placeholder="Username" required />
    <button type="submit">Login</button></form>`;

  res.send(form);
}

/**
@function custom_verify

@description
The method creates a user object with the email property from the request body username and a lookup property set to true.

The user object is passed to the redirect method which will handle the ACL lookup, cookie signing, and response redirection.

@param {req} req HTTP request.
@param {res} res HTTP response.
*/
async function custom_verify(req, res) {
  const user = {
    email: req.body.username,
    lookup: true,
  };
  redirect(req, res, user);
}
