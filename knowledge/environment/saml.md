---
type: Environment Variable
title: SAML
description: SAML_* and SLO_CALLBACK configure single sign-on through an identity provider with the optional SAML app.
resource: ../../apps/saml/saml.js
tags: [xyz, saml, environment, security, auth, sso]
status: draft
x-xyz-variables: [SAML_*, SLO_CALLBACK]
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Process-Environment/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - resource: ../../apps/saml/saml.js
  - resource: ../../apps/saml/server.js
  - resource: ../../apps/saml/README.md
  - resource: ../../apps/saml/vercel.json
  - resource: ../../apps/xyz/mod/user/redirect.js
  - resource: ../../apps/xyz/mod/user/cookie.js
  - resource: ../../apps/xyz/mod/utils/processEnv.js
  - resource: ../../apps/saml/tests/saml.test.mjs
  - resource: ../../apps/saml/tests/saml.flow.test.mjs
  - resource: ../../apps/saml/tests/server.test.mjs
---
# SAML

The SAML variables configure the SAML app, which `apps/saml/server.js` mounts
on the XYZ server under `${DIR}/saml/`. They have no effect on a server
started from `apps/xyz` alone. Each value is passed to
[node-saml](https://github.com/node-saml/node-saml) under the option name in
brackets.

| Variable | Purpose |
|---|---|
| `SAML_ENTITY_ID` | Service provider entity id (`issuer`). |
| `SAML_ACS` | Assertion consumer service URL, ending `/saml/acs` (`callbackUrl`). |
| `SAML_SSO` | Identity provider sign-on URL (`entryPoint`). |
| `SAML_SLO` | Identity provider logout URL (`logoutUrl`). |
| `SLO_CALLBACK` | URL the identity provider returns to after logout, ending `/saml/logout/callback` (`logoutCallbackUrl`). |
| `SAML_IDP_CRT` | Base name of the identity provider certificate file (`idpCert`). |
| `SAML_SP_CRT` | Base name of the service provider key and certificate files (`privateKey`, `publicCert`). |
| `SAML_SIGNATURE_ALGORITHM` | Signing algorithm, eg. `sha256` (`signatureAlgorithm`). |
| `SAML_IDENTIFIER_FORMAT` | Name id format (`identifierFormat`). |
| `SAML_PROVIDER_NAME` | Service provider display name (`providerName`). |
| `SAML_WANT_ASSERTIONS_SIGNED` | `true` or `false` (`wantAssertionsSigned`). |
| `SAML_AUTHN_RESPONSE_SIGNED` | `true` or `false`, default `false` (`wantAuthnResponseSigned`). |
| `SAML_ACCEPTED_CLOCK_SKEW` | Clock skew in milliseconds, default `60000` (`acceptedClockSkewMs`). |
| `SAML_DISABLE_REQUESTED_AUTHN_CONTEXT` | Default `true` (`disableRequestedAuthnContext`). |

`SAML_WANT_ASSERTIONS_SIGNED` and `SAML_AUTHN_RESPONSE_SIGNED` accept only
`true` and `false`; any other value is treated as unset. Unset,
`SAML_WANT_ASSERTIONS_SIGNED` leaves the node-saml default.
`SAML_DISABLE_REQUESTED_AUTHN_CONTEXT` is `true` when unset and otherwise
only when the value is `true`.

`SAML_ACCEPTED_CLOCK_SKEW` must be a non-negative integer. Any other value
logs a warning and uses `60000`, because a negative skew would turn off the
assertion `NotBefore` and `NotOnOrAfter` checks; they cannot be disabled. A
server clock out of step with the IdP by more than the skew has valid logins
rejected. `InResponseTo` is not validated, so IdP-initiated logins work.

## Certificates

`SAML_IDP_CRT=idp` reads `idp.crt`. `SAML_SP_CRT=sp` reads both `sp.pem`, the
private key, and `sp.crt`. The files are read relative to the `apps/saml`
directory, not `XYZ_CWD`, and `apps/saml/vercel.json` ships `apps/saml/*.crt`
and `apps/saml/*.pem`. `sp.pem` must be an unencrypted PEM private key, and
`sp.crt` exactly one X.509 certificate matching it, not a bare public key or a
chain. `/saml/metadata` publishes the SP certificate as the signing
certificate; without `SAML_SP_CRT` requests and logout responses are unsigned.

## Startup checks

`server.js` creates the SAML configuration on startup. It is invalid when
`SAML_ACS`, `SAML_ENTITY_ID`, `SAML_IDP_CRT` or `SAML_SSO` is unset, a
certificate file cannot be read, or the SP key pair fails the checks above;
the error names the variable or file. Run with `node server.js`, the process
exits. On Vercel every request to the deployment, not only the SAML routes,
gets a `500` and the error is logged for each request.

## Users and sessions

A SAML login needs an [ACL](access-control.md) and a signing secret. The ACS
rejects an invalid response, or one without a `nameID`, with a `401`. It
takes the user email from the profile `email`, else the `nameID`, and looks it
up in the ACL; an error in that lookup gets a `500`. A user who is missing,
blocked, unverified or unapproved is refused. The token is signed with
`COOKIE_TTL` like any login, and holds the SAML `nameID`, `nameIDFormat`,
`nameQualifier`, `spNameQualifier` and `sessionIndex` for logout. Cookie
renewal keeps them, since some IdPs reject a LogoutRequest without the
format and qualifiers.

The ACS answers with a short HTML page which navigates to the redirect target,
so the default `SameSite=Strict` cookie is sent; `COOKIE_PROPS` does not need
to change for SAML. Absolute redirect targets must be listed in
[TRUSTED_RETURN_HOSTS](trusted-return-hosts.md).

`/saml/logout` clears the cookie first, so the local session ends even if the
IdP never returns. Only a cookie with a valid signature, expired or not, and a
`nameID` and `sessionIndex` sends the user to `SAML_SLO` with a signed
LogoutRequest; any other user is redirected to `DIR`. The logout callback
clears the cookie. A signed LogoutRequest from the IdP, in the Redirect or
POST binding, is answered with a LogoutResponse redirect to the IdP; anything
else redirects to `DIR`.

## Login routing

Set `AUTH_PATH=/saml` so that a `PRIVATE` instance sends users to the SAML
login and view templates link to it. `SAML_LOGIN` was removed in v5.

```dotenv
AUTH_PATH=/saml
SAML_ENTITY_ID=https://maps.example.com
SAML_ACS=https://maps.example.com/saml/acs
SAML_SSO=https://idp.example.com/sso
SAML_IDP_CRT=idp
SAML_SP_CRT=sp
```
