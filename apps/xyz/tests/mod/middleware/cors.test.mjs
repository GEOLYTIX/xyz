import http from 'node:http';
import express from 'express';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

globalThis.xyzEnv = {};

const { default: cors } = await import(
  '@geolytix/xyz-app/mod/middleware/cors.js'
);

describe('middleware: cors', () => {
  let server;
  let baseUrl;

  beforeAll(async () => {
    const app = express();
    app.use(cors);
    app.get('/api/workspace', (req, res) => res.send('workspace'));
    app.post('/api/query', (req, res) => res.send('query'));

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    baseUrl = `http://localhost:${server.address().port}`;
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    globalThis.xyzEnv = {};
  });

  it('sets no CORS headers without CORS_ORIGINS', async () => {
    const res = await fetch(`${baseUrl}/api/workspace`, {
      headers: { Origin: 'https://cdpn.io' },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('echoes a listed origin and varies on Origin', async () => {
    globalThis.xyzEnv = {
      CORS_ORIGINS: 'https://codepen.io, https://cdpn.io',
    };

    const res = await fetch(`${baseUrl}/api/workspace`, {
      headers: { Origin: 'https://cdpn.io' },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('access-control-allow-origin')).toBe(
      'https://cdpn.io',
    );
    expect(res.headers.get('vary')).toMatch(/Origin/);
    expect(res.headers.get('access-control-allow-credentials')).toBeNull();
  });

  it('sets no CORS headers for an origin which is not listed', async () => {
    globalThis.xyzEnv = { CORS_ORIGINS: 'https://cdpn.io' };

    const res = await fetch(`${baseUrl}/api/workspace`, {
      headers: { Origin: 'https://example.com' },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('allows any origin with *', async () => {
    globalThis.xyzEnv = { CORS_ORIGINS: '*' };

    const res = await fetch(`${baseUrl}/api/workspace`, {
      headers: { Origin: 'https://example.com' },
    });

    expect(res.headers.get('access-control-allow-origin')).toBe('*');
  });

  it('answers a preflight request from a listed origin with 204', async () => {
    globalThis.xyzEnv = { CORS_ORIGINS: 'https://cdpn.io' };

    const res = await fetch(`${baseUrl}/api/query`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://cdpn.io',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      },
    });

    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe(
      'https://cdpn.io',
    );
    expect(res.headers.get('access-control-allow-methods')).toBe(
      'GET, POST, OPTIONS',
    );
    expect(res.headers.get('access-control-allow-headers')).toBe(
      'content-type',
    );
  });

  it('does not answer a preflight request from an origin which is not listed', async () => {
    globalThis.xyzEnv = { CORS_ORIGINS: 'https://cdpn.io' };

    const res = await fetch(`${baseUrl}/api/query`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://example.com',
        'Access-Control-Request-Method': 'POST',
      },
    });

    expect(res.status).not.toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });
});
