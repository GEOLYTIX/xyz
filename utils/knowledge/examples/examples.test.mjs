import { fileURLToPath } from 'node:url';
import { describe, expect, inject, it } from 'vitest';
import { collectExamples, exampleLocales, UNFILTERED } from '../examples.mjs';

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

/** A layer with zoom ranges is queried with its first table. */
const firstTable = (layer) =>
  layer.table ?? Object.values(layer.tables ?? {}).find(Boolean);

/** Query params of a dataview; flags resolve in the browser, the test resolves table. */
function dataviewParams(locale, layer, dataview) {
  const params = new URLSearchParams({
    template: dataview.query,
    locale,
    layer: layer.key,
  });
  for (const [param, value] of Object.entries(dataview.queryparams ?? {})) {
    if (value !== true) params.set(param, value);
    else if (param === 'table') params.set('table', firstTable(layer));
  }
  return params;
}

function rows(locale, layer) {
  const params = new URLSearchParams({
    template: layer.format,
    locale,
    layer: layer.key,
    table: firstTable(layer),
    geom: layer.geom,
    srid: layer.srid,
  });
  return get(`/api/query?${params}`);
}

/** One test group per locale; an example with named locales has several. */
const locales = collectExamples(root).flatMap((example) =>
  exampleLocales(example).map(([id]) => ({ path: example.path, id })),
);

/** The infoj fields which location_get selects: entries with a field and no query. */
const infojFields = (layer) =>
  layer.infoj
    .filter((entry) => entry?.field && !entry.query)
    .map((entry) => entry.field.toLowerCase());

/** A query result with rows, a row with values, or a single value, eg. a count. */
const nonEmpty = (result) =>
  Array.isArray(result)
    ? result.length > 0
    : result !== null && typeof result === 'object'
      ? Object.keys(result).length > 0
      : result !== undefined && result !== null;

// Checks which do not apply to an example skip, so a pass means the check ran.
describe.each(locales)('$path example $id', ({ id }) => {
  it('loads as a locale with layers', async () => {
    expect((await layers(id)).length).toBeGreaterThan(0);
  });

  it('returns data for its vector layers', async ({ skip }) => {
    const queried = (await layers(id)).filter((layer) =>
      QUERIED.has(layer.format),
    );
    skip(!queried.length, 'no wkt or geojson layer');
    for (const layer of queried) {
      const result = await rows(id, layer);
      expect(Array.isArray(result), `${layer.key} returns rows`).toBe(true);
      expect(result.length, `${layer.key} returns rows`).toBeGreaterThan(0);
    }
  });

  it('opens a location of each layer with infoj', async ({ skip }) => {
    const located = (await layers(id)).filter(
      (layer) => QUERIED.has(layer.format) && Array.isArray(layer.infoj),
    );
    skip(!located.length, 'no wkt or geojson layer with infoj');
    for (const layer of located) {
      const [first] = await rows(id, layer);
      // The wkt and geojson templates return the id first.
      const locationId = Array.isArray(first) ? first[0] : first.id;
      const params = new URLSearchParams({
        template: 'location_get',
        locale: id,
        layer: layer.key,
        table: firstTable(layer),
        id: locationId,
      });
      const [location] = [await get(`/api/query?${params}`)].flat();
      expect(location, `${layer.key} location ${locationId}`).toBeTruthy();
      // Unquoted column aliases are lower case in PostgreSQL.
      const keys = Object.keys(location).map((key) => key.toLowerCase());
      expect(keys, `${layer.key} location fields`).toEqual(
        expect.arrayContaining(infojFields(layer)),
      );
    }
  });

  it('runs the query of each layer dataview', async ({ skip }) => {
    const dataviews = (await layers(id)).flatMap((layer) =>
      Object.entries(layer.dataviews ?? {})
        .filter(([, dataview]) => dataview?.query)
        .map(([key, dataview]) => ({ layer, key, dataview })),
    );
    skip(!dataviews.length, 'no layer dataview with a query');
    for (const { layer, key, dataview } of dataviews) {
      const params = dataviewParams(id, layer, dataview);
      const response = await get(`/api/query?${params}`);
      expect(nonEmpty(response), `${layer.key} dataview ${key}`).toBe(true);
    }
  });

  it('searches with its gazetteer', async ({ skip }) => {
    const locale = await get(`/api/workspace/locale?locale=${id}`);
    const gazetteer = locale.gazetteer;
    skip(!gazetteer?.qterm, 'no gazetteer with a qterm');
    const layer = (await layers(id)).find((l) => l.key === gazetteer.layer);
    expect(layer, `gazetteer layer ${gazetteer.layer}`).toBeTruthy();
    const params = new URLSearchParams({
      template: gazetteer.query || 'gaz_query',
      locale: id,
      layer: layer.key,
      table: gazetteer.table || firstTable(layer),
      qID: layer.qID,
      qterm: gazetteer.qterm,
      label: gazetteer.label || gazetteer.qterm,
      limit: gazetteer.limit || 10,
      term: 'T*',
      wildcard: '*',
    });
    const results = await get(`/api/query?${params}`);
    expect([results].flat().length, 'gazetteer results').toBeGreaterThan(0);
  });

  it('removes rows with each default filter', async ({ skip }) => {
    const filtered = (await layers(id)).filter(
      (layer) => QUERIED.has(layer.format) && layer.filter?.default,
    );
    skip(!filtered.length, 'no wkt or geojson layer with filter.default');
    for (const layer of filtered) {
      const all = await rows(`${id}${UNFILTERED}`, layer);
      const some = await rows(id, layer);
      expect(some.length, `${layer.key} default filter`).toBeLessThan(
        all.length,
      );
    }
  });
});
