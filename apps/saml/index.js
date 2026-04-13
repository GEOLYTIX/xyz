/**
@module saml-extension
@description

Server extension entrypoint for the extracted SAML app.

This module exposes route installers through the base app extension registry so
the root backend can opt into SAML explicitly. The mounted routes are:

- `GET /saml/metadata`
- `GET /saml/login`
- `GET /saml/logout`
- `POST /saml/logout/callback`
- `POST /saml/acs`

The POST routes install `express.urlencoded()` because SAML responses are sent
as form posts by the identity provider.
*/

import '../xyz/mod/utils/processEnv.js';
import saml from './saml.js';

const samlExtension = {
  expressRoutes: [
    // Mount the SAML endpoints directly on the server app.
    (app, { express }) => {
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
    },
  ],
};

export default samlExtension;
