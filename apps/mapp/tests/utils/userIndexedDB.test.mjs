import { describe, expect, it, onTestFinished } from 'vitest';
import * as userIndexedDB from '../../lib/utils/userIndexedDB.mjs';

/**
Returns a database name for a test. The tests of a run share the IndexedDB of the browser context.
*/
function dbName() {
  return `test-${crypto.randomUUID()}`;
}

/**
Returns the name and version of a database.
*/
async function database(name) {
  const dbs = await indexedDB.databases();

  return dbs.find((db) => db.name === name);
}

describe('utils/userIndexedDB', () => {
  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.userIndexedDB.openDB).toBe(userIndexedDB.openDB);
    expect(mapp.utils.userIndexedDB.add).toBe(userIndexedDB.add);
    expect(mapp.utils.userIndexedDB.get).toBe(userIndexedDB.get);
    expect(mapp.utils.userIndexedDB.list).toBe(userIndexedDB.list);
    expect(mapp.utils.userIndexedDB.put).toBe(userIndexedDB.put);
    expect(mapp.utils.userIndexedDB.remove).toBe(userIndexedDB.remove);
  });

  it('creates the database with the store', async () => {
    const indexedDB = dbName();

    expect(await database(indexedDB)).toBeUndefined();

    const IDB = await userIndexedDB.openDB({ indexedDB, store: 'locales' });

    expect(IDB).toBeInstanceOf(IDBDatabase);
    expect(IDB.name).toBe(indexedDB);
    expect([...IDB.objectStoreNames]).toEqual(['locales']);

    expect(await database(indexedDB)).toEqual({ name: indexedDB, version: 3 });
  });

  it('opens a database which has a later version', async () => {
    const name = dbName();

    // A database with a later version than the default version of the openDB method.
    await new Promise((resolve, reject) => {
      const request = indexedDB.open(name, 5);

      request.onupgradeneeded = () =>
        request.result.createObjectStore('locales');

      request.onsuccess = () => {
        request.result.close();
        resolve();
      };

      request.onerror = () => reject(request.error);
    });

    const IDB = await userIndexedDB.openDB({
      indexedDB: name,
      store: 'locales',
    });

    expect(IDB.version).toBe(5);
    expect([...IDB.objectStoreNames]).toEqual(['locales']);
  });

  it('names the database from the user title', async () => {
    mapp.user = { title: dbName() };

    onTestFinished(() => {
      delete mapp.user;
    });

    const params = { store: 'locales' };

    const IDB = await userIndexedDB.openDB(params);

    expect(params.indexedDB).toBe(mapp.user.title);
    expect(IDB.name).toBe(mapp.user.title);
  });

  it('names the database MAPP without a user title', async () => {
    expect(mapp.user).toBeUndefined();

    const params = { store: 'test' };

    const IDB = await userIndexedDB.openDB(params);

    expect(params.indexedDB).toBe('MAPP');
    expect(IDB.name).toBe('MAPP');
  });

  it('puts and gets an object by its name', async () => {
    const indexedDB = dbName();

    const obj = { key: 'smoke', name: 'My locale', layers: [{ key: 'a' }] };

    // The put resolves with the key of the record.
    expect(
      await userIndexedDB.put({
        indexedDB,
        store: 'locales',
        name: 'My locale',
        obj,
      }),
    ).toBe('My locale');

    const stored = await userIndexedDB.get({
      indexedDB,
      store: 'locales',
      name: 'My locale',
    });

    expect(stored).toEqual(obj);
    expect(stored).not.toBe(obj);
  });

  it('gets undefined for a name which is not in the store', async () => {
    const stored = await userIndexedDB.get({
      indexedDB: dbName(),
      store: 'locales',
      name: 'unknown',
    });

    expect(stored).toBeUndefined();
  });

  it('overwrites the object of a name', async () => {
    const params = { indexedDB: dbName(), store: 'locales', name: 'locale' };

    await userIndexedDB.put({ ...params, obj: { version: 1 } });
    await userIndexedDB.put({ ...params, obj: { version: 2 } });

    expect(await userIndexedDB.get({ ...params })).toEqual({ version: 2 });
  });

  it('lists the key and name of the objects in the store', async () => {
    const params = { indexedDB: dbName(), store: 'locales' };

    expect(await userIndexedDB.list({ ...params })).toEqual([]);

    await userIndexedDB.put({
      ...params,
      name: 'b',
      obj: { key: 'london', name: 'London', layers: [] },
    });

    await userIndexedDB.put({
      ...params,
      name: 'a',
      obj: { key: 'paris', name: 'Paris', view: { z: 10 } },
    });

    // The records are in the order of their names in the store.
    expect(await userIndexedDB.list({ ...params })).toEqual([
      { key: 'paris', name: 'Paris' },
      { key: 'london', name: 'London' },
    ]);
  });

  it('removes an object by its name', async () => {
    const params = { indexedDB: dbName(), store: 'locales' };

    await userIndexedDB.put({ ...params, name: 'a', obj: { key: 'a' } });
    await userIndexedDB.put({ ...params, name: 'b', obj: { key: 'b' } });

    expect(
      await userIndexedDB.remove({ ...params, name: 'a' }),
    ).toBeUndefined();

    expect(await userIndexedDB.get({ ...params, name: 'a' })).toBeUndefined();
    expect(await userIndexedDB.get({ ...params, name: 'b' })).toEqual({
      key: 'b',
    });
  });

  it('does not store the admin, roles and blocked properties of a user', async () => {
    const params = { indexedDB: dbName(), store: 'user', name: 'user' };

    const obj = {
      email: 'test@geolytix.co.uk',
      language: 'en',
      admin: true,
      roles: ['a', 'b'],
      blocked: false,
    };

    await userIndexedDB.put({ ...params, obj });

    expect(await userIndexedDB.get({ ...params })).toEqual({
      email: 'test@geolytix.co.uk',
      language: 'en',
    });

    // The properties are deleted from the object.
    expect(obj).toEqual({ email: 'test@geolytix.co.uk', language: 'en' });
  });

  it('stores the admin, roles and blocked properties in other stores', async () => {
    const params = { indexedDB: dbName(), store: 'locales', name: 'locale' };

    const obj = { admin: true, roles: ['a'], blocked: false };

    await userIndexedDB.put({ ...params, obj });

    expect(await userIndexedDB.get({ ...params })).toEqual(obj);
  });
});
