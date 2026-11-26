/**
The server tests import server.js with the XYZ app and the SAML module mocked, to check how an invalid SAML configuration is reported on startup.
*/
import { createMocks } from 'node-mocks-http';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const app = { get: vi.fn(), post: vi.fn() };
const getSamlStrat = vi.fn();

vi.mock('@geolytix/xyz-app/server', () => ({ default: app }));

vi.mock('../saml.js', () => ({
  default: vi.fn(),
  getSamlStrat: (...args) => getSamlStrat(...args),
}));

globalThis.xyzEnv = { DIR: '/app' };

describe('saml server:', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('exports the app with the SAML routes for a valid configuration', async () => {
    vi.stubEnv('VERCEL', '1');

    const { default: handler } = await import('../server.js');

    expect(getSamlStrat).toHaveBeenCalledOnce();
    expect(handler).toBe(app);
    expect(app.get).toHaveBeenCalledWith(
      '/app/saml/metadata',
      expect.anything(),
    );
    expect(console.error).not.toHaveBeenCalled();
  });

  it('logs an invalid configuration on Vercel and fails every request with a 500', async () => {
    vi.stubEnv('VERCEL', '1');
    getSamlStrat.mockImplementation(() => {
      throw new Error('SAML: SAML_ACS is not set.');
    });

    const { default: handler } = await import('../server.js');

    expect(handler).not.toBe(app);
    expect(console.error).toHaveBeenCalledWith('SAML: SAML_ACS is not set.');

    console.error.mockClear();

    const { req, res } = createMocks({
      method: 'GET',
      url: '/app/api/workspace',
    });
    handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getData()).toBe('The SAML configuration is invalid.');
    expect(console.error).toHaveBeenCalledWith('SAML: SAML_ACS is not set.');
  });

  it('throws an invalid configuration when not on Vercel', async () => {
    vi.stubEnv('VERCEL', '');
    getSamlStrat.mockImplementation(() => {
      throw new Error('SAML: SAML_ACS is not set.');
    });

    await expect(import('../server.js')).rejects.toThrow(
      'SAML: SAML_ACS is not set.',
    );
  });
});
