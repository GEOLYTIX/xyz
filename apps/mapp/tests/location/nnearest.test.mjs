import { describe, expect, it } from 'vitest';
import { addLayers, createMapview, getLocale } from '../helpers.mjs';

async function retailPoints() {
  const locale = await getLocale('grocery');

  const mapview = await createMapview(locale, locale.view);

  await addLayers(mapview);

  return mapview.layers.retail_points;
}

/**
Returns the cluster feature with the most stores.
*/
function largestCluster(layer) {
  return layer.cluster.source
    .getFeatures()
    .reduce((a, b) =>
      b.get('features').length > a.get('features').length ? b : a,
    );
}

describe('location nnearest', () => {
  it('lists the stores of a cluster in a popup', async () => {
    const layer = await retailPoints();

    const feature = largestCluster(layer);

    const count = feature.get('count');

    expect(count).toBe(layer.cluster.max_size);

    await mapp.location.nnearest({
      mapview: layer.mapview,
      layer,
      feature,
      table: layer.table,
    });

    const popup = layer.mapview.popup();

    expect(popup).toBeTruthy();

    const items = [...popup.querySelectorAll('ul.list > li')];

    // The n nearest stores are the stores of the cluster.
    expect(items).toHaveLength(count);

    const names = feature
      .get('features')
      .map((F) => F.get('store_name'))
      .filter(Boolean);

    // The cluster features only have the store_name if the label is a style field.
    for (const name of names) {
      expect(items.map((li) => li.textContent)).toContain(name);
    }

    layer.mapview.popup(null);
  });

  it('gets the location of a list item', async () => {
    const layer = await retailPoints();

    const feature = largestCluster(layer);

    await mapp.location.nnearest({
      mapview: layer.mapview,
      layer,
      feature,
      table: layer.table,
    });

    const li = layer.mapview.popup().querySelector('ul.list > li');

    const label = li.textContent;

    li.click();

    // The click removes the popup.
    expect(layer.mapview.popup()).toBeFalsy();

    await expect
      .poll(() => Object.values(layer.mapview.locations).length)
      .toBe(1);

    const location = Object.values(layer.mapview.locations)[0];

    expect(location.table).toBe(layer.table);
    expect(
      location.infoj.find((entry) => entry.field === 'store_name').value,
    ).toBe(label);

    location.remove();
  });

  it('limits the list to the max param', async () => {
    const layer = await retailPoints();

    const feature = largestCluster(layer);

    expect(feature.get('count')).toBeGreaterThan(2);

    await mapp.location.nnearest({
      mapview: layer.mapview,
      layer,
      feature,
      table: layer.table,
      max: 2,
    });

    expect(layer.mapview.popup().querySelectorAll('ul.list > li')).toHaveLength(
      2,
    );

    layer.mapview.popup(null);
  });
});
