import { describe, expect, it } from 'vitest';
import { addLayers, createMapview, getLocale } from '../../helpers.mjs';

/**
The osm layer is the testhost osm template in the default locale of the test workspace. The layer isn't displayed, so the tests don't request tiles.
*/
async function osmLayer() {
  const locale = await getLocale('smoke');

  const mapview = await createMapview(locale, { lat: 51.5, lng: -0.1, z: 10 });

  await addLayers(mapview);

  return mapview.layers.osm;
}

/**
Dispatches a render event with a 2d canvas context on the Openlayers layer and returns the context.
*/
function render(layer, type, context = canvasContext()) {
  layer.L.dispatchEvent({ type, context });

  return context;
}

function canvasContext() {
  return document.createElement('canvas').getContext('2d');
}

describe('tiles', () => {
  it('creates an OSM tile layer with the layer URI', async () => {
    const layer = await osmLayer();

    expect(layer.display).toBe(false);
    expect(layer.L).toBeInstanceOf(ol.layer.Tile);
    expect(layer.L.getClassName()).toBe('mapp-layer-osm');

    const source = layer.L.getSource();

    expect(source).toBeInstanceOf(ol.source.OSM);
    expect(source.getProjection().getCode()).toBe('EPSG:3857');
    expect(source.getUrls()).toEqual([
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    ]);
  });

  it('applies the style.contextFilter to the layer render', async () => {
    const layer = await osmLayer();

    expect(layer.style.contextFilter).toBe('grayscale(100%)');

    const context = canvasContext();

    context.globalCompositeOperation = 'multiply';

    render(layer, 'prerender', context);

    expect(context.filter).toBe('grayscale(100%)');
    expect(context.globalCompositeOperation).toBe('source-over');

    // The filter must not apply to the layers rendered after the tile layer on a shared canvas.
    render(layer, 'postrender', context);

    expect(context.filter).toBe('none');
  });

  it('ignores render events without a context', async () => {
    const layer = await osmLayer();

    expect(() => layer.L.dispatchEvent({ type: 'prerender' })).not.toThrow();
  });

  it('has no render listeners without a style.contextFilter', () => {
    const layer = {
      key: 'tiles',
      URI: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    };

    mapp.layer.formats.tiles(layer);

    expect(layer.source).toBe('OSM');
    expect(layer.L.hasListener('prerender')).toBe(false);
    expect(layer.L.hasListener('postrender')).toBe(false);

    const context = render(layer, 'prerender');

    expect(context.filter).toBe('none');
  });
});
