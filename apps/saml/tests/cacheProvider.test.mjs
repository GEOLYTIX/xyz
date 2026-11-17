/**
The ACL cache provider is tested against the PGlite PostGIS database from packages/devdb.

The ACL connection is created from the PRIVATE environment variable on import, so the environment is set before the cache provider is imported.
*/
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { startDevDb } from '../../../packages/devdb/index.js';

const devdb = await startDevDb({ port: 0 });

globalThis.xyzEnv = {
  PRIVATE: `${devdb.connectionString}|public.acl_table`,
};

const { createAclCacheProvider } = await import('../cacheProvider.js');
const { default: acl } = await import('@geolytix/xyz-app/mod/user/acl.js');

await acl(`
  CREATE TABLE IF NOT EXISTS acl_schema.saml_cache (
    key text PRIMARY KEY,
    value text NOT NULL,
    expires_at timestamptz NOT NULL
  );`);

afterAll(async () => {
  // The ACL pool logs the error of its idle clients when the database stops.
  vi.spyOn(console, 'error').mockImplementation(() => {});
  await devdb.stop();
});

describe('saml cache provider:', () => {
  const cache = createAclCacheProvider();

  beforeEach(async () => {
    await acl('DELETE FROM acl_schema.saml_cache;');
  });

  it('saves an assertion ID only once while it is valid', async () => {
    const expiresAtMs = Date.now() + 60000;

    expect(await cache.saveIfAbsentAsync('a', 'first', expiresAtMs)).toBe(true);
    expect(await cache.saveIfAbsentAsync('a', 'second', expiresAtMs)).toBe(
      false,
    );
  });

  it('accepts only one of two concurrent saves', async () => {
    const expiresAtMs = Date.now() + 60000;

    const saved = await Promise.all([
      cache.saveIfAbsentAsync('b', 'one', expiresAtMs),
      cache.saveIfAbsentAsync('b', 'two', expiresAtMs),
    ]);

    expect(saved.filter(Boolean)).toHaveLength(1);
  });

  it('replaces an expired key and removes other expired keys', async () => {
    const expired = Date.now() - 1000;

    await cache.saveIfAbsentAsync('c', 'old', expired);
    await cache.saveIfAbsentAsync('d', 'old', expired);

    expect(await cache.saveIfAbsentAsync('c', 'new', Date.now() + 60000)).toBe(
      true,
    );

    const rows = await acl(
      'SELECT key, value FROM acl_schema.saml_cache ORDER BY key;',
    );

    expect(rows).toEqual([{ key: 'c', value: 'new' }]);
  });

  it('gets, consumes and removes saved keys', async () => {
    await cache.saveAsync('e', 'value');

    expect(await cache.getAsync('e')).toBe('value');
    expect(await cache.consumeAsync('e')).toBe('value');
    expect(await cache.consumeAsync('e')).toBeNull();

    await cache.saveAsync('f', 'value');

    expect(await cache.removeAsync('f')).toBe('value');
    expect(await cache.getAsync('f')).toBeNull();
    expect(await cache.removeAsync(null)).toBeNull();
  });

  it('throws if the cache table is not available', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await acl('ALTER TABLE acl_schema.saml_cache RENAME TO saml_cache_moved;');

    try {
      await expect(
        cache.saveIfAbsentAsync('g', 'value', Date.now() + 60000),
      ).rejects.toThrow(
        'The SAML cache table acl_schema.saml_cache is not available.',
      );
    } finally {
      await acl(
        'ALTER TABLE acl_schema.saml_cache_moved RENAME TO saml_cache;',
      );
      vi.restoreAllMocks();
    }
  });
});

describe('saml cache provider without an ACL:', () => {
  it('requires an ACL connection', async () => {
    vi.resetModules();
    vi.doMock('@geolytix/xyz-app/mod/user/acl.js', () => ({ default: null }));

    const { createAclCacheProvider } = await import('../cacheProvider.js');

    expect(() => createAclCacheProvider()).toThrow(
      'SAML requires an ACL connection in the PRIVATE or PUBLIC environment variable.',
    );

    vi.doUnmock('@geolytix/xyz-app/mod/user/acl.js');
  });
});
