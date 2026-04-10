// Global test setup for vitest
// Ensures globalThis.xyzEnv exists before any module tries to access it.
globalThis.xyzEnv ??= {};
