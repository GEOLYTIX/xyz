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

// The SAML configuration is created on startup. A missing environment variable or certificate file fails the server start instead of the first login.
getSamlStrat();

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

export default app;
