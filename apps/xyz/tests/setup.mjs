import process from 'node:process';
import { fileURLToPath } from 'node:url';

// Keep fixture paths like file:./tests/assets/... stable regardless of where
// Vitest was launched from (CLI package dir vs VS Code workspace root).
const testWorkspaceRoot = fileURLToPath(new URL('..', import.meta.url));

if (process.cwd() !== testWorkspaceRoot) {
  process.chdir(testWorkspaceRoot);
}

// Ensures globalThis.xyzEnv exists before any module tries to access it.
globalThis.xyzEnv ??= {};
