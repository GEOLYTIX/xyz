import { fileURLToPath } from 'node:url';
import { describe, expect, inject, it } from 'vitest';
import { collectExamples, UNFILTERED } from '../examples.mjs';

const root = fileURLToPath(new URL('../../..', import.meta.url));

/** Layer formats whose data the example test queries. */
const QUERIED = new Set(['wkt', 'geojson']);

async function get(path) {
  const response = await fetch(`${inject('XYZ_HOST')}${path}`);
  const text = await response.text();
  expect(response.status, `${path}: ${text}`).toBe(200);
  return JSON.parse(text);
}

async function layers(locale) {
  const result = await get(
    `/api/workspace/locale?locale=${locale}&layers=true`,
  );
  return Array.isArray(result.layers)
    ? result.layers
    : Object.values(result.layers ?? {});
}

function rows(locale, layer) {
  const params = new URLSearchParams({
    template: layer.format,
    locale,
    layer: layer.key,
    // A layer with zoom ranges is queried with its first table.
    table: layer.table ?? Object.values(layer.tables ?? {}).find(Boolean),
    geom: layer.geom,
    srid: layer.srid,
  });
  return get(`/api/query?${params}`);
}

describe.each(collectExamples(root))('$path example $id', ({ id }) => {
  it('loads as a locale with layers', async () => {
    expect((await layers(id)).length).toBeGreaterThan(0);
  });

  it('returns data for its vector layers', async () => {
    const queried = (await layers(id)).filter((layer) =>
      QUERIED.has(layer.format),
    );
    for (const layer of queried) {
      const result = await rows(id, layer);
      expect(Array.isArray(result), `${layer.key} returns rows`).toBe(true);
      expect(result.length, `${layer.key} returns rows`).toBeGreaterThan(0);
    }
  });

  it('opens a location of each layer with infoj', async () => {
    const located = (await layers(id)).filter(
      (layer) => QUERIED.has(layer.format) && Array.isArray(layer.infoj),
    );
    for (const layer of located) {
      const [first] = await rows(id, layer);
      // The wkt and geojson templates return the id first.
      const locationId = Array.isArray(first) ? first[0] : first.id;
      const params = new URLSearchParams({
        template: 'location_get',
        locale: id,
        layer: layer.key,
        table: layer.table ?? Object.values(layer.tables ?? {}).find(Boolean),
        id: locationId,
      });
      const location = await get(`/api/query?${params}`);
      expect(location, `${layer.key} location ${locationId}`).toBeTruthy();
    }
  });

  it('removes rows with each default filter', async () => {
    const filtered = (await layers(id)).filter(
      (layer) => QUERIED.has(layer.format) && layer.filter?.default,
    );
    for (const layer of filtered) {
      const all = await rows(`${id}${UNFILTERED}`, layer);
      const some = await rows(id, layer);
      expect(some.length, `${layer.key} default filter`).toBeLessThan(
        all.length,
      );
    }
  });
});
