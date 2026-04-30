/**
The saml server script imports an express app from /apps/xyz

The express app is extended with routes to the saml module imported from /apps/saml
*/

// biome-ignore assist/source/organizeImports: The processEnv import must be first to set the global.xyzEnv for the other imports.
import '@geolytix/xyz-app/mod/utils/processEnv.js';
import redirect from '@geolytix/xyz-app/mod/user/redirect.js';
import process from 'node:process';
import express from 'express';

const [{ default: app }] = await Promise.all([
  import('@geolytix/xyz-app/server'),
]);

app.get(`${xyzEnv.DIR}/custom/logout`, custom_logout);
app.get(`${xyzEnv.DIR}/custom/login`, custom_login);
app.post(
  `${xyzEnv.DIR}/custom/verify`,
  [express.urlencoded({ extended: true }), express.json({ limit: '5mb' })],
  custom_verify,
);

export default app;

function custom_login(req, res) {
  const form = `<form method="POST" action="${xyzEnv.DIR}/custom/verify">
    <input type="text" name="username" placeholder="Username" required />
    <button type="submit">Login</button></form>`;

  res.send(form);
}

function custom_logout(req, res) {
  res.send('custom logout');
}

async function custom_verify(req, res) {
  const user = {
    email: req.body.username,
    lookup: true,
  };
  redirect(req, res, user);
}
