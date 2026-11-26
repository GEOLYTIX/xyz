/**
The saml server script imports an express app from /apps/xyz

The express app is extended with routes to the saml module imported from /apps/saml
*/

import process from 'node:process';
import { fileURLToPath } from 'node:url';
import express from 'express';

const workspaceRoot = fileURLToPath(new URL('../..', import.meta.url));

// The xyz app resolves built-in file references from XYZ_CWD when provided.
process.env.XYZ_CWD ??= workspaceRoot;

const [{ default: app }, { default: saml, getSamlStrat }] = await Promise.all([
  import('@geolytix/xyz-app/server'),
  import('./saml.js'),
]);

let samlConfigError;

// The SAML configuration is created on startup, so a missing environment variable or certificate file fails the deployment instead of the first login.
try {
  getSamlStrat();
} catch (error) {
  // The XYZ app listens on import when not on Vercel. Rethrowing ends the process with the error.
  if (!process.env.VERCEL) throw error;

  // Vercel imports this module in its own loader, which does not log a failed import. The error is logged here and again for every request it fails, so the reason appears in the runtime logs.
  samlConfigError = error;
  console.error(error.message);
}

app.get(`${xyzEnv.DIR}/saml/metadata`, saml);
app.get(`${xyzEnv.DIR}/saml/logout`, saml);
app.get(`${xyzEnv.DIR}/saml/login`, saml);
app.get(`${xyzEnv.DIR}/saml/logout/callback`, saml);
app.post(
  `${xyzEnv.DIR}/saml/logout/callback`,
  express.urlencoded({ extended: true }),
  saml,
);
app.post(
  `${xyzEnv.DIR}/saml/acs`,
  express.urlencoded({ extended: true }),
  saml,
);

export default samlConfigError ? samlConfigErrorHandler : app;

/**
@function samlConfigErrorHandler
@description
Answers every request with a 500 when the SAML configuration is invalid on Vercel, and logs the configuration error for the request.

@param {req} req HTTP request.
@param {res} res HTTP response.
*/
function samlConfigErrorHandler(req, res) {
  console.error(samlConfigError.message);
  res.status(500).send('The SAML configuration is invalid.');
}
