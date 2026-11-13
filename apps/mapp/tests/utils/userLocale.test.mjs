import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as userLocale from '../../lib/utils/userLocale.mjs';
import { addLayers, createMapview, getLocale } from '../helpers.mjs';

/**
Returns a mapview with the layers of the smoke locale. The locale has a workspace for the test, which is the name of the userIndexedDB database. The tests of a run share the IndexedDB of the browser context.
*/
async function smoke(name) {
  const locale = await getLocale('smoke');

  const mapview = await createMapview(locale);

  await addLayers(mapview);

  Object.assign(mapview.locale, {
    workspace: `test-${crypto.randomUUID()}`,
    name,
  });

  return mapview;
}

describe('utils/userLocale', () => {
  beforeEach(() => {
    // The userLocale methods require the mapp.user.
    mapp.user = { email: 'test@geolytix.co.uk' };
  });

  afterEach(() => {
    delete mapp.user;
  });

  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.userLocale.get).toBe(userLocale.get);
    expect(mapp.utils.userLocale.putLocale).toBe(userLocale.putLocale);
    expect(mapp.utils.userLocale.list).toBe(userLocale.list);
    expect(mapp.utils.userLocale.remove).toBe(userLocale.remove);
  });

  it('stores the locale of a mapview with its layers', async () => {
    const mapview = await smoke('My smoke');

    const { workspace, name } = mapview.locale;

    // The put resolves with the name of the locale.
    expect(await userLocale.putLocale(mapview)).toBe('My smoke');

    const stored = await userLocale.get({ workspace, name });

    expect(stored.key).toBe('smoke');
    expect(stored.name).toBe('My smoke');
    expect(stored.workspace).toBe(workspace);

    // The layers are stored as an array of the mapview layers as JSON.
    expect(stored.layers.map((layer) => layer.key)).toEqual(
      Object.keys(mapview.layers),
    );

    const locations = stored.layers.find((layer) => layer.key === 'locations');

    expect(locations.table).toBe('example.locations');
    expect(locations.format).toBe('wkt');

    // The Openlayers layer and the mapview are not stored.
    expect(locations.L).toBeUndefined();
    expect(locations.mapview).toBeUndefined();
  });

  it('gets undefined for a locale which is not stored', async () => {
    const stored = await userLocale.get({
      workspace: `test-${crypto.randomUUID()}`,
      name: 'unknown',
    });

    expect(stored).toBeUndefined();
  });

  it('overwrites a stored locale with the same name', async () => {
    const mapview = await smoke('My smoke');

    const { workspace, name } = mapview.locale;

    await userLocale.putLocale(mapview);

    mapview.locale.view = { lat: 52.5, lng: 13.4, z: 9 };

    await userLocale.putLocale(mapview);

    expect(await userLocale.list(workspace)).toHaveLength(1);

    const stored = await userLocale.get({ workspace, name });

    expect(stored.view).toEqual({ lat: 52.5, lng: 13.4, z: 9 });
  });

  it('lists the key and name of the locales stored for a workspace', async () => {
    const mapview = await smoke('B smoke');

    const { workspace } = mapview.locale;

    expect(await userLocale.list(workspace)).toEqual([]);

    await userLocale.putLocale(mapview);

    mapview.locale.name = 'A smoke';

    await userLocale.putLocale(mapview);

    expect(await userLocale.list(workspace)).toEqual([
      { key: 'smoke', name: 'A smoke' },
      { key: 'smoke', name: 'B smoke' },
    ]);
  });

  it('removes a stored locale', async () => {
    const mapview = await smoke('My smoke');

    const { workspace, name } = mapview.locale;

    await userLocale.putLocale(mapview);

    expect(await userLocale.remove({ workspace, name })).toBeUndefined();

    expect(await userLocale.get({ workspace, name })).toBeUndefined();
    expect(await userLocale.list(workspace)).toEqual([]);
  });
});
