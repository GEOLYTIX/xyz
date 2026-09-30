import { createPublicKey, generateKeyPairSync } from 'node:crypto';
import * as fs from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import jwt from 'jsonwebtoken';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

// processEnv runs its setup on import, so every test imports a fresh copy.
// varlock is mocked to keep the test runner's own `varlock run` environment from re-hydrating process.env.
const varlock = vi.hoisted(() => ({
  initVarlockEnv: vi.fn(),
  patchGlobalConsole: vi.fn(),
  patchGlobalServerResponse: vi.fn(),
  patchGlobalResponse: vi.fn(),
  isEncryptedBlob: vi.fn(),
  decryptEnvBlobSync: vi.fn(),
}));

vi.mock('varlock', () => ({
  internal: { initVarlockEnv: varlock.initVarlockEnv },
  patchGlobalConsole: varlock.patchGlobalConsole,
  patchGlobalServerResponse: varlock.patchGlobalServerResponse,
  patchGlobalResponse: varlock.patchGlobalResponse,
}));

vi.mock('varlock/encrypt-env', () => ({
  isEncryptedBlob: varlock.isEncryptedBlob,
  decryptEnvBlobSync: varlock.decryptEnvBlobSync,
}));

// The frozen blob is read from a fixed path in the repository root, so fs passes through
// to the real module unless a test stubs the blob.
vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal();
  const mocked = {
    ...actual,
    existsSync: vi.fn(actual.existsSync),
    readFileSync: vi.fn(actual.readFileSync),
  };
  return { ...mocked, default: mocked };
});

const managedKeys = [
  'VERCEL',
  '_VARLOCK_ENV_KEY',
  '__VARLOCK_ENV',
  'XYZ_CWD',
  'SECRET',
  'SECRET_KEY',
  'SECRET_ALGORITHM',
  'DIR',
  'AUTH_PATH',
  'COOKIE_TTL',
  'COOKIE_PROPS',
  'JWT_TYPE',
  'JWT_ISSUER',
  'JWT_AUDIENCE',
  'FAILED_ATTEMPTS',
  'PORT',
  'RATE_LIMIT',
  'RATE_LIMIT_WINDOW',
  'RETRY_LIMIT',
  'TITLE',
  'TRANSPORT_PORT',
  'TRANSPORT_TLS',
  'WORKSPACE_AGE',
  'FILE_RESOURCES',
];

/**
@function loadEnv
@async
@description
Clears the environment variables processEnv reads, applies the given ones and imports a fresh processEnv module.
@param {Object} [vars] Environment variables for this import.
@returns {Promise<Object>} The xyzEnv object the module assigned to globalThis.
*/
async function loadEnv(vars = {}) {
  for (const key of Object.keys(process.env)) {
    if (managedKeys.includes(key) || key.startsWith('SIGN_')) {
      delete process.env[key];
    }
  }
  Object.assign(process.env, vars);

  vi.resetModules();
  delete globalThis.xyzEnv;

  await import('../../../mod/utils/processEnv.js');
  return globalThis.xyzEnv;
}

const actualFs = await vi.importActual('node:fs');

const isBlobPath = (path) => String(path).endsWith('.varlock.blob');

describe('processEnv', () => {
  let originalEnv;
  let keyDir;
  let privateKey;
  let publicKey;

  beforeAll(() => {
    ({ privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      publicKeyEncoding: { type: 'spki', format: 'pem' },
    }));

    keyDir = fs.mkdtempSync(join(tmpdir(), 'xyz-processEnv-'));
    fs.writeFileSync(join(keyDir, 'secret.pem'), privateKey);
    fs.writeFileSync(join(keyDir, 'SIGNER.pem'), 'signer-key');
  });

  afterAll(() => {
    fs.rmSync(keyDir, { recursive: true, force: true });
  });

  beforeEach(() => {
    originalEnv = { ...process.env };
    vi.clearAllMocks();
    fs.existsSync.mockImplementation(actualFs.existsSync);
    fs.readFileSync.mockImplementation(actualFs.readFileSync);
  });

  afterEach(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key];
    }
    Object.assign(process.env, originalEnv);

    vi.restoreAllMocks();
    globalThis.xyzEnv = {};
  });

  describe('varlock', () => {
    it('initialises varlock without failing when there is nothing to hydrate', async () => {
      await loadEnv();

      expect(varlock.initVarlockEnv).toHaveBeenCalledWith({ allowFail: true });
    });

    it('patches console and responses to redact sensitive values', async () => {
      await loadEnv();

      expect(varlock.patchGlobalConsole).toHaveBeenCalledOnce();
      expect(varlock.patchGlobalServerResponse).toHaveBeenCalledOnce();
      expect(varlock.patchGlobalResponse).toHaveBeenCalledOnce();
    });

    it('does not look for a frozen blob outside Vercel', async () => {
      await loadEnv();

      expect(fs.existsSync.mock.calls.some(([path]) => isBlobPath(path))).toBe(
        false,
      );
      expect(process.env.__VARLOCK_ENV).toBeUndefined();
    });
  });

  describe('Vercel frozen blob', () => {
    function stubBlob(content) {
      fs.existsSync.mockImplementation((path) =>
        isBlobPath(path) ? true : actualFs.existsSync(path),
      );
      fs.readFileSync.mockImplementation((path, ...args) =>
        isBlobPath(path) ? content : actualFs.readFileSync(path, ...args),
      );
    }

    it('falls back to the process environment when no blob ships', async () => {
      fs.existsSync.mockImplementation((path) =>
        isBlobPath(path) ? false : actualFs.existsSync(path),
      );

      await loadEnv({ VERCEL: '1' });

      expect(fs.existsSync.mock.calls.some(([path]) => isBlobPath(path))).toBe(
        true,
      );
      expect(process.env.__VARLOCK_ENV).toBeUndefined();
      expect(varlock.initVarlockEnv).toHaveBeenCalledWith({ allowFail: true });
    });

    it('hydrates from a plain blob', async () => {
      stubBlob('plain-blob');
      varlock.isEncryptedBlob.mockReturnValue(false);

      await loadEnv({ VERCEL: '1' });

      expect(process.env.__VARLOCK_ENV).toBe('plain-blob');
      expect(varlock.decryptEnvBlobSync).not.toHaveBeenCalled();
    });

    it('decrypts an encrypted blob with _VARLOCK_ENV_KEY', async () => {
      stubBlob('encrypted-blob');
      varlock.isEncryptedBlob.mockReturnValue(true);
      varlock.decryptEnvBlobSync.mockReturnValue('decrypted-blob');

      await loadEnv({ VERCEL: '1', _VARLOCK_ENV_KEY: 'blob-key' });

      expect(varlock.decryptEnvBlobSync).toHaveBeenCalledWith(
        'encrypted-blob',
        'blob-key',
      );
      expect(process.env.__VARLOCK_ENV).toBe('decrypted-blob');
    });

    it('throws when an encrypted blob has no _VARLOCK_ENV_KEY', async () => {
      stubBlob('encrypted-blob');
      varlock.isEncryptedBlob.mockReturnValue(true);

      await expect(loadEnv({ VERCEL: '1' })).rejects.toThrow(
        '.varlock.blob is encrypted but _VARLOCK_ENV_KEY is not set',
      );
    });
  });

  describe('SECRET_KEY', () => {
    it('uses an inline PEM as the signing secret', async () => {
      const xyzEnv = await loadEnv({ SECRET_KEY: privateKey });

      expect(xyzEnv.SECRET).toBe(privateKey);
      expect(xyzEnv.SECRET_ALGORITHM).toBe('RS256');
    });

    it('ignores leading whitespace before an inline PEM', async () => {
      const xyzEnv = await loadEnv({ SECRET_KEY: `\n  ${privateKey}` });

      expect(xyzEnv.SECRET).toBe(privateKey);
    });

    it('does not read an inline PEM as a file path', async () => {
      await loadEnv({ SECRET_KEY: `\n${privateKey}` });

      expect(fs.readFileSync).not.toHaveBeenCalledWith(
        expect.stringContaining('-----BEGIN'),
      );
    });

    it('reads a key file relative to XYZ_CWD', async () => {
      const xyzEnv = await loadEnv({
        XYZ_CWD: keyDir,
        SECRET_KEY: 'secret.pem',
      });

      expect(xyzEnv.SECRET).toBe(privateKey);
      expect(xyzEnv.SECRET_ALGORITHM).toBe('RS256');
    });

    it('throws when the key file does not exist', async () => {
      await expect(
        loadEnv({ XYZ_CWD: keyDir, SECRET_KEY: 'missing.pem' }),
      ).rejects.toThrow('ENOENT');
    });

    it('signs tokens which verify against the derived public key', async () => {
      const xyzEnv = await loadEnv({ SECRET_KEY: privateKey });

      const token = jwt.sign({ email: 'test@geolytix.co.uk' }, xyzEnv.SECRET, {
        algorithm: xyzEnv.SECRET_ALGORITHM,
      });

      expect(
        createPublicKey(xyzEnv.SECRET).export({ type: 'spki', format: 'pem' }),
      ).toBe(publicKey);
      expect(
        jwt.verify(token, publicKey, { algorithms: ['RS256'] }).email,
      ).toBe('test@geolytix.co.uk');
    });

    it('keeps a configured SECRET_ALGORITHM', async () => {
      const xyzEnv = await loadEnv({
        SECRET_KEY: privateKey,
        SECRET_ALGORITHM: 'RS512',
      });

      expect(xyzEnv.SECRET_ALGORITHM).toBe('RS512');
    });

    it('defaults to HS256 with a plain SECRET', async () => {
      const xyzEnv = await loadEnv({ SECRET: 'plain-secret' });

      expect(xyzEnv.SECRET).toBe('plain-secret');
      expect(xyzEnv.SECRET_ALGORITHM).toBe('HS256');
    });
  });

  describe('paths', () => {
    it('adds a leading slash and removes a trailing slash from DIR and AUTH_PATH', async () => {
      const xyzEnv = await loadEnv({ DIR: 'xyz/', AUTH_PATH: 'auth/' });

      expect(xyzEnv.DIR).toBe('/xyz');
      expect(xyzEnv.AUTH_PATH).toBe('/auth');
    });

    it('leaves well formed paths unchanged', async () => {
      const xyzEnv = await loadEnv({ DIR: '/xyz', AUTH_PATH: '/auth' });

      expect(xyzEnv.DIR).toBe('/xyz');
      expect(xyzEnv.AUTH_PATH).toBe('/auth');
    });

    it('scopes the default COOKIE_PROPS path to DIR', async () => {
      const xyzEnv = await loadEnv({ DIR: 'xyz' });

      expect(xyzEnv.COOKIE_PROPS).toBe(
        'Secure; HttpOnly; SameSite=Strict; Path=/xyz',
      );
    });

    it('defaults XYZ_CWD to the workspace root', async () => {
      const xyzEnv = await loadEnv();

      expect(fs.existsSync(join(xyzEnv.XYZ_CWD, 'pnpm-workspace.yaml'))).toBe(
        true,
      );
    });

    it('uses a configured XYZ_CWD', async () => {
      const xyzEnv = await loadEnv({ XYZ_CWD: keyDir });

      expect(xyzEnv.XYZ_CWD).toBe(keyDir);
    });
  });

  describe('defaults', () => {
    it('applies defaults when variables are not set', async () => {
      const xyzEnv = await loadEnv();

      expect(xyzEnv).toMatchObject({
        COOKIE_TTL: 36000,
        DIR: '',
        COOKIE_PROPS: 'Secure; HttpOnly; SameSite=Strict; Path=/',
        JWT_TYPE: 'session',
        JWT_ISSUER: 'xyz',
        JWT_AUDIENCE: 'xyz',
        FAILED_ATTEMPTS: '3',
        PORT: 3000,
        RATE_LIMIT: '1000',
        RATE_LIMIT_WINDOW: '60000',
        RETRY_LIMIT: '3',
        SECRET_ALGORITHM: 'HS256',
        TITLE: 'GEOLYTIX | XYZ',
        TRANSPORT_PORT: 587,
        TRANSPORT_TLS: 'false',
        WORKSPACE_AGE: '3600000',
        FILE_RESOURCES: 'resources',
        WALLET: {},
      });
    });

    it('applies defaults to empty values injected by varlock', async () => {
      const xyzEnv = await loadEnv({ PORT: '', TITLE: '', COOKIE_TTL: '' });

      expect(xyzEnv.PORT).toBe(3000);
      expect(xyzEnv.TITLE).toBe('GEOLYTIX | XYZ');
      expect(xyzEnv.COOKIE_TTL).toBe(36000);
    });

    it('keeps an empty COOKIE_PROPS and JWT claims', async () => {
      const xyzEnv = await loadEnv({
        COOKIE_PROPS: '',
        JWT_TYPE: '',
        JWT_ISSUER: '',
        JWT_AUDIENCE: '',
      });

      expect(xyzEnv.COOKIE_PROPS).toBe('');
      expect(xyzEnv.JWT_TYPE).toBe('');
      expect(xyzEnv.JWT_ISSUER).toBe('');
      expect(xyzEnv.JWT_AUDIENCE).toBe('');
    });

    it('parses numeric values from configured strings', async () => {
      const xyzEnv = await loadEnv({
        PORT: '8080',
        COOKIE_TTL: '600',
        TRANSPORT_PORT: '465',
      });

      expect(xyzEnv.PORT).toBe(8080);
      expect(xyzEnv.COOKIE_TTL).toBe(600);
      expect(xyzEnv.TRANSPORT_PORT).toBe(465);
    });
  });

  describe('xyzEnv', () => {
    it('passes through other environment variables', async () => {
      const xyzEnv = await loadEnv({ DBS_TEST: 'postgres://localhost/test' });

      expect(xyzEnv.DBS_TEST).toBe('postgres://localhost/test');
    });

    it('adds SIGN_* key files to the WALLET', async () => {
      const xyzEnv = await loadEnv({ XYZ_CWD: keyDir, SIGN_SIGNER: 'true' });

      expect(xyzEnv.WALLET.SIGNER).toBe('signer-key');
    });

    it('logs a SIGN_* key file which cannot be read', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});

      const xyzEnv = await loadEnv({ XYZ_CWD: keyDir, SIGN_MISSING: 'true' });

      expect(xyzEnv.WALLET.MISSING).toBeUndefined();
      expect(error).toHaveBeenCalledWith(
        expect.stringContaining('File Signer: Error: ENOENT'),
      );
    });

    it('is frozen', async () => {
      const xyzEnv = await loadEnv();

      expect(Object.isFrozen(xyzEnv)).toBe(true);
    });

    it('does not replace an existing globalThis.xyzEnv', async () => {
      await loadEnv();
      const existing = globalThis.xyzEnv;

      vi.resetModules();
      await import('../../../mod/utils/processEnv.js');

      expect(globalThis.xyzEnv).toBe(existing);
    });
  });
});
