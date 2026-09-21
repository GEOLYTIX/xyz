/**
@function sessionClaims

@description
The sessionClaims method returns a claims object to be included in a signed session cookie token.

The claims allow another service to authenticate its users through xyz by verifying the token type, issuer, and audience.

The `typ` claim distinguishes a real user session token from a key.js API-key token.

The `xyzEnv.SESSION_TYPE`, `xyzEnv.SESSION_ISSUER`, and `xyzEnv.SESSION_AUDIENCE` variables must be configured for the claims to be included in the signed token.

@returns {object} The claims object with typ, iss, and aud properties to be merged into the signed token payload.
*/
export default function sessionClaims() {
  return {
    typ: xyzEnv.SESSION_TYPE,
    iss: xyzEnv.SESSION_ISSUER,
    aud: xyzEnv.SESSION_AUDIENCE.split(','),
  };
}
