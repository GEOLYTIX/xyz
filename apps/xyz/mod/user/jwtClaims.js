/**
## /user/jwtClaims

Export the jwtClaims function which generates the claims for a signed user [session] cookie token.

@requires module:/utils/processEnv
@module jwtClaims
*/

/**
@function jwtClaims

@description
The jwtClaims method returns a claims object to be included in a signed user [session] cookie token.

The claims allow another service to authenticate its users through xyz by verifying the token type, issuer, and audience.

The `typ` claim distinguishes a real user session token from a key.js API-key token.

The `xyzEnv.JWT_TYPE`, `xyzEnv.JWT_ISSUER`, and `xyzEnv.JWT_AUDIENCE` variables must be configured for the claims to be included in the signed token.

@returns {object} The claims object with typ, iss, and aud properties to be merged into the signed token payload.
*/
export default function jwtClaims() {
  return {
    typ: xyzEnv.JWT_TYPE,
    iss: xyzEnv.JWT_ISSUER,
    aud: xyzEnv.JWT_AUDIENCE.split(','),
  };
}
