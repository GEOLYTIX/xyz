// Derives a public key for LOGIN_PUBLIC_KEY from the SECRET_KEY private key,
// given inline or as a key file. processEnv resolves it exactly as the app does.
import { createPublicKey } from 'node:crypto';
import '../apps/xyz/mod/utils/processEnv.js';

if (!process.env.SECRET_KEY) {
  console.error(
    'SECRET_KEY is not set — RS256 signing needs a private key to derive a public key from.',
  );
  process.exit(1);
}

console.log(
  createPublicKey(xyzEnv.SECRET)
    .export({ type: 'spki', format: 'pem' })
    .toString(),
);
