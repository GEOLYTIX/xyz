import { describe, expect, it } from 'vitest';
import { addLayers, createMapview, getLocale } from '../helpers.mjs';

async function mapview() {
  const locale = await getLocale('smoke');

  const view = await createMapview(locale, { lat: 48, lng: 5, z: 4 });

  await addLayers(view);

  return view;
}

function olLayers(view) {
  return view.Map.getLayers().getArray();
}

describe('mapview removeLayer', () => {
  it('removes a layer by key', async () => {
    const view = await mapview();

    const L = view.layers.locations.L;

    view.removeLayer('locations');

    expect(view.layers.locations).toBeUndefined();
    expect(olLayers(view)).not.toContain(L);
    expect(view.layers.features).toBeDefined();
  });

  it('removes an array of layers', async () => {
    const view = await mapview();

    view.removeLayer([view.layers.locations, 'features']);

    expect(Object.keys(view.layers)).toEqual(['osm']);
  });

  it('resolves the renderComplete promise after the next render', async () => {
    const view = await mapview();

    const renderComplete = view.renderComplete;

    view.removeLayer('features');

    expect(view.renderComplete).not.toBe(renderComplete);

    await expect(view.renderComplete).resolves.toBeDefined();
  });
});
