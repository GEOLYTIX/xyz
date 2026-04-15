/**
The saml-server script imports an express app from /apps/xyz

The express app is extended with routes to the saml module imported from /apps/saml
*/

import app from '@geolytix/xyz-app/server';
import saml from '@geolytix/xyz-saml-app';
import express from 'express';

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
