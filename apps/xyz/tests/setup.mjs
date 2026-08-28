import { resolve } from 'node:path';
import process from 'node:process';

// Keep fixture paths like file:./tests/assets/... stable regardless of where
// Vitest was launched from (CLI package dir vs VS Code workspace root).
// import.meta.dirname is used rather than fileURLToPath, since a jsdom test
// environment replaces the URL global with one which node does not accept.
const testWorkspaceRoot = resolve(import.meta.dirname, '..');

if (process.cwd() !== testWorkspaceRoot) {
  process.chdir(testWorkspaceRoot);
}

// Ensures globalThis.xyzEnv exists before any module tries to access it.
globalThis.xyzEnv ??= {};
