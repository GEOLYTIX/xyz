// Claims that let another service authenticate its users through xyz,
// distinguishing a real session from a key.js API-key token.
export default function sessionClaims() {
  return {
    typ: xyzEnv.SESSION_TYP,
    iss: xyzEnv.SESSION_ISS,
    aud: xyzEnv.SESSION_AUD.split(','),
  };
}
