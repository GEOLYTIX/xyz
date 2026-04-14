/**
The root backend composes the base XYZ app with optional direct routes.

SAML is mounted here as an extracted backend app so fork-level server wiring is
kept explicit in the root application.
 */

import app from '@geolytix/xyz-app/server';
import saml from '@geolytix/xyz-saml-app';
import express from 'express';

app.get(`${xyzEnv.DIR}/saml/metadata`, saml);
app.get(`${xyzEnv.DIR}/saml/logout`, saml);
app.get(`${xyzEnv.DIR}/saml/login`, saml);
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
