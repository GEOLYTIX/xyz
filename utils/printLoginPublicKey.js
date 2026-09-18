// Derives a public key for LOGIN_PUBLIC_KEY from the SECRET_KEY private key
// file, the one thing today's RS256 setup doesn't already produce.
import { createPublicKey } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

if (!process.env.SECRET_KEY) {
  console.error(
    'SECRET_KEY is not set — RS256 signing needs a private key file to derive a public key from.',
  );
  process.exit(1);
}

const privateKey = readFileSync(resolve(root, process.env.SECRET_KEY));

console.log(
  createPublicKey(privateKey)
    .export({ type: 'spki', format: 'pem' })
    .toString(),
);
