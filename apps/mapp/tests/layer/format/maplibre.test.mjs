import { describe, expect, inject, it, onTestFinished, vi } from 'vitest';
import { createMapview, getLocale } from '../../helpers.mjs';

/**
The maplibre format imports the maplibre-gl library with mapp.utils.esmImport from esm.sh. The tests don't stub the import, so a broken esm.sh build of the pinned version fails the tests.

The esmImport promise is cached, so this module is the same module which the format uses.
*/
const MAPLIBRE = 'maplibre-gl@5.23.0';

const MaplibreGL = await mapp.utils.esmImport(MAPLIBRE);

/**
The Mapbox tests request styles and tiles from the Mapbox API with an access token. The token is provided by the vitest config from the MAPBOX_ACCESS_TOKEN environment variable or a gitignored .env.local file. The tests are skipped without a token.

The MAPBOX_STYLE_URL can be set to test another Mapbox style. The default is a Mapbox Studio style of our account.
*/
const token = inject('MAPBOX_ACCESS_TOKEN');

const styleURL =
  inject('MAPBOX_STYLE_URL') ||
  'mapbox://styles/dbauszus/cl9795mb900gk14nr88zfoitd';

/**
Removes the access token from a string, eg. a request url in an assertion message.
*/
function mapboxRequests(xhr) {
  return xhr.mock.calls
    .map(([params]) => (typeof params === 'string' ? params : params.url))
    .filter((url) => url.startsWith('https://api.mapbox.com'));
}

function redact(str) {
  return token ? String(str).replaceAll(token, '<token>') : String(str);
}

/**
Returns the maplibre style for the countries layer. The vector tiles are requested from the testhost mvt query template with the naturalearth.countries rows of the devdb.

The tile url must be absolute, because maplibre requests the tiles from a web worker.

The source bounds limit the tile requests to central Europe. The devdb runs one query at a time in the Node process of the test run, and tiles with many large country polygons block the queries of other test files.
*/
function devdbStyle() {
  const params = mapp.utils.paramString({
    fields: 'name,continent',
    geom: 'geom_3857',
    layer: 'countries',
    locale: 'maplibre',
    table: 'naturalearth.countries',
    template: 'mvt',
  });

  return {
    version: 8,
    sources: {
      countries: {
        type: 'vector',
        tiles: [`${mapp.host}/api/query?${params}&z={z}&x={x}&y={y}`],
        bounds: [5, 47, 15, 55],
        maxzoom: 6,
      },
    },
    layers: [
      {
        id: 'countries-fill',
        type: 'fill',
        source: 'countries',
        'source-layer': 'countries',
        paint: {
          'fill-color': [
            'match',
            ['get', 'continent'],
            'Europe',
            '#4363d8',
            '#999999',
          ],
        },
      },
      {
        id: 'countries-line',
        type: 'line',
        source: 'countries',
        'source-layer': 'countries',
        paint: { 'line-color': '#333333' },
      },
    ],
  };
}

/**
Adds the countries layer of the maplibre locale to a mapview. The config is assigned to the layer before the layer is decorated.

The maplibre Map is not assigned to the layer. It is captured from the jumpTo call of the layer render and removed when the test finishes, so the WebGL context is released.

@returns {Promise<Object>} The mapview, the layer, and the maplibre map which is undefined if the layer has not been rendered.
*/
async function maplibreLayer(config) {
  const locale = await getLocale('maplibre');

  const layer = locale.layers.find((layer) => layer.key === 'countries');

  Object.assign(layer, config);

  const jumpTo = vi.spyOn(MaplibreGL.Map.prototype, 'jumpTo');

  const mapview = await createMapview(locale, locale.view);

  await mapview.addLayer([layer]);

  // The mapview may have rendered before a failed layer decoration has returned. Without a layer the map doesn't render again and the renderComplete promise would not resolve.
  if (mapview.layers.countries) await mapview.renderComplete;

  const map = jumpTo.mock.contexts[0];

  onTestFinished(() => map?.remove());

  return { mapview, layer: mapview.layers.countries, map };
}

/**
Resolves once maplibre has loaded the style and the tiles in the view.
*/
async function loaded(map) {
  await expect.poll(() => map.loaded(), { timeout: 20000 }).toBe(true);
}

describe('maplibre', () => {
  it('imports maplibre-gl from esm.sh', () => {
    expect(MaplibreGL).not.toBeInstanceOf(Error);
    expect(typeof MaplibreGL.Map).toBe('function');
    expect(typeof MaplibreGL.setRTLTextPlugin).toBe('function');
    expect(MaplibreGL.getVersion()).toBe(MAPLIBRE.split('@')[1]);
  });

  it('renders the devdb countries as maplibre vector tiles', async () => {
    const esmImport = vi.spyOn(mapp.utils, 'esmImport');

    const { mapview, layer, map } = await maplibreLayer({
      style: { object: devdbStyle() },
    });

    // The format imports maplibre-gl from esm.sh for the first layer.
    expect(esmImport).toHaveBeenCalledWith(MAPLIBRE);

    expect(layer.L).toBeInstanceOf(ol.layer.Layer);
    expect(layer.container.classList).toContain('maplibre');
    // The render method returns the container to the Openlayers layers element.
    expect(mapview.Map.getTargetElement().contains(layer.container)).toBe(true);
    expect(layer.container.style.visibility).toBe('visible');

    await loaded(map);

    // The maplibre zoom is one less than the Openlayers zoom, because maplibre has 512px tiles.
    expect(map.getZoom()).toBeCloseTo(mapview.Map.getView().getZoom() - 1);

    const sourceNames = map
      .querySourceFeatures('countries', { sourceLayer: 'countries' })
      .map((F) => F.properties.name);

    expect(sourceNames).toEqual(
      expect.arrayContaining(['Germany', 'France', 'Poland']),
    );
    expect(sourceNames).not.toContain('Australia');

    // The feature at the center of Germany is rendered with the continent property for the data driven fill-color.
    const [feature] = map.queryRenderedFeatures(map.project([10.4, 51.1]), {
      layers: ['countries-fill'],
    });

    expect(feature.properties).toEqual({
      id: expect.any(Number),
      name: 'Germany',
      continent: 'Europe',
    });
  });

  it('warns and does not add a layer without a style', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { layer } = await maplibreLayer();

    expect(layer).toBeUndefined();
    expect(warn).toHaveBeenCalledWith(
      'countries failed to load, check that an access token and a style.URL are provided.',
    );
  });

  it('warns and does not request a Mapbox style.URL without an accessToken', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const xhr = vi.spyOn(mapp.utils, 'xhr');

    const { layer } = await maplibreLayer({ style: { URL: styleURL } });

    expect(layer).toBeUndefined();
    expect(mapboxRequests(xhr)).toEqual([]);
    expect(warn).toHaveBeenCalledWith(
      'countries failed to load, check that an access token and a style.URL are provided.',
    );
  });

  it('does not add a layer if the Mapbox API rejects the accessToken', async () => {
    const xhr = vi.spyOn(mapp.utils, 'xhr');

    const { layer, map } = await maplibreLayer({
      accessToken: 'pk.invalid',
      style: { URL: styleURL },
    });

    expect(layer).toBeUndefined();
    expect(map).toBeUndefined();

    const [url] = mapboxRequests(xhr);

    expect(url).toMatch(/^https:\/\/api\.mapbox\.com\/styles\/v1\//);
    expect(url).toContain('access_token=pk.invalid');

    const response = await xhr.mock.results.at(-1).value;

    expect(response).toBeInstanceOf(Error);
    // The Mapbox API responds with 401 or 403, depending on the request origin.
    expect(response.message).toMatch(/^HTTP 40[13]$/);
  });

  describe.skipIf(!token)('Mapbox API', () => {
    // The Mapbox style, sprite, glyphs and tiles are requested from the Mapbox API.
    it(
      'loads the Mapbox style and tiles with the accessToken',
      {
        timeout: 30000,
      },
      async () => {
        const xhr = vi.spyOn(mapp.utils, 'xhr');
        const error = vi.spyOn(console, 'error');

        // Maplibre logs style validation and request errors to the console. The errors are reported if the map doesn't load.
        const errors = () =>
          error.mock.calls.map((args) => redact(args.join(' ')));

        const { layer, map } = await maplibreLayer({
          accessToken: token,
          style: { URL: styleURL },
        });

        const [url] = mapboxRequests(xhr);

        expect(redact(url)).toMatch(
          /^https:\/\/api\.mapbox\.com\/styles\/v1\/.+\?access_token=<token>$/,
        );

        // The style object is requested by the format, not by maplibre.
        expect(layer.style.object.version).toBe(8);
        expect(layer.L).toBeInstanceOf(ol.layer.Layer);

        await loaded(map).catch(() => {
          throw new Error(
            `The Mapbox style did not load: ${errors().join('; ')}`,
          );
        });

        // The style sources, sprites and glyphs are mapbox:// urls which the transformRequest method resolves to the Mapbox API with the accessToken.
        const sources = Object.values(map.getStyle().sources).filter((source) =>
          source.url?.startsWith('mapbox://'),
        );

        expect(sources.length).toBeGreaterThan(0);

        // Features are only rendered if the tiles have been loaded from the Mapbox API.
        expect(map.queryRenderedFeatures().length).toBeGreaterThan(0);

        // Maplibre logs failed style, sprite, glyph, and tile requests as errors.
        expect(errors()).toEqual([]);
      },
    );
  });
});
