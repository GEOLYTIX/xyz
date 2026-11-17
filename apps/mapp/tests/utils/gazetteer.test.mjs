import { describe, expect, it, vi } from 'vitest';
import * as gazetteerUtils from '../../lib/utils/gazetteer.mjs';
import { addLayers, createMapview, getLocale } from '../helpers.mjs';

// Lidl Walworth Road in the grocery locale view.
const LIDL = 1010025395;

/**
Returns a mapview with the retail_points layer of the grocery locale. The localeConfig is assigned to the locale before the mapview is created, eg. `{ extent: {} }`.
*/
async function grocery(localeConfig) {
  const locale = await getLocale('grocery');

  Object.assign(locale, localeConfig);

  const mapview = await createMapview(locale, locale.view);

  await addLayers(mapview);

  return mapview;
}

/**
Returns a gazetteer config with the search input and the result list elements, which are created by the MAPP.UI gazetteer element.
*/
function gazetteer(mapview, config) {
  const input = document.createElement('input');

  input.value = 'term';

  return { mapview, input, list: document.createElement('ul'), ...config };
}

/**
Spies on the mapp.utils.xhr method. The requests are sent to the testhost.
*/
function spyXhr() {
  return vi.spyOn(mapp.utils, 'xhr');
}

/**
Returns the params of the gazetteer search requests. The layers of the mapview also request their data with the mapp.utils.xhr method.
*/
function searches(xhr) {
  return xhr.mock.calls
    .map(([params]) => params)
    .filter((params) => params?.url?.includes('template=gaz_query'));
}

/**
Resolves once the responses of the xhr requests have been processed by the search method.
*/
async function searched(xhr) {
  await Promise.all(xhr.mock.results.map((result) => result.value));

  // The search method processes the response in a then callback.
  await new Promise((resolve) => setTimeout(resolve));
}

/**
Returns the label and result text of each row in the result list.
*/
function rows(list) {
  return [...list.children].map((li) =>
    [...li.querySelectorAll('span')].map((span) => span.textContent),
  );
}

function searchParams(xhr, search = 0) {
  return new URL(searches(xhr)[search].url).searchParams;
}

describe('utils/gazetteer', () => {
  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.gazetteer.datasets).toBe(gazetteerUtils.datasets);
    expect(mapp.utils.gazetteer.getLocation).toBe(gazetteerUtils.getLocation);
  });
});

describe('utils/gazetteer datasets', () => {
  it('searches the qterm field of the gazetteer layer', async () => {
    const mapview = await grocery();

    const xhr = spyXhr();

    const gaz = gazetteer(mapview, {
      layer: 'retail_points',
      qterm: 'store_name',
    });

    mapp.utils.gazetteer.datasets('Lidl Walworth Road', gaz);

    await searched(xhr);

    expect(searches(xhr)).toHaveLength(1);
    expect(searches(xhr)[0]).toBe(gaz);

    // The request is cached, and debounced for the layer and qterm.
    expect(gaz.cache).toBe(true);
    expect(gaz.debounce).toBe('retail_pointsstore_name');

    const params = searchParams(xhr);

    expect(new URL(gaz.url).origin).toBe(mapp.host);
    expect(params.get('template')).toBe('gaz_query');
    expect(params.get('layer')).toBe('retail_points');
    expect(params.get('locale')).toBe('grocery');
    expect(params.get('table')).toBe('geodata.uk_glx_open_retail_points');
    expect(params.get('qID')).toBe('id');
    expect(params.get('qterm')).toBe('store_name');
    expect(params.get('label')).toBe('store_name');
    expect(params.get('term')).toBe('Lidl Walworth Road*');
    expect(params.get('wildcard')).toBe('*');
    expect(params.get('limit')).toBe('10');

    // The row has the layer name as label.
    expect(rows(gaz.list)).toEqual([['Grocery', 'Lidl Walworth Road']]);
  });

  it('searches with the limit, label, table, query and leading_wildcard of the gazetteer', async () => {
    const mapview = await grocery();

    const xhr = spyXhr();

    const gaz = gazetteer(mapview, {
      layer: 'retail_points',
      qterm: 'store_name',
      label: 'postcode',
      title: 'Stores',
      limit: 3,
      leading_wildcard: true,
      table: 'geodata.uk_glx_open_retail_points',
      query: 'gaz_query',
    });

    mapp.utils.gazetteer.datasets('Walworth Road', gaz);

    await searched(xhr);

    const params = searchParams(xhr);

    expect(params.get('term')).toBe('*Walworth Road*');
    expect(params.get('label')).toBe('postcode');
    expect(params.get('limit')).toBe('3');

    const results = rows(gaz.list);

    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(3);

    // The row has the gazetteer title as label, and the postcode of the Lidl Walworth Road store as result.
    expect(results).toContainEqual(['Stores', 'SE17 2TG']);
  });

  it('searches with the current filter of the layer', async () => {
    const mapview = await grocery();

    const xhr = spyXhr();

    mapview.layers.retail_points.filter.current = {
      retailer: { in: ['Aldi'] },
    };

    const gaz = gazetteer(mapview, {
      layer: 'retail_points',
      qterm: 'store_name',
    });

    mapp.utils.gazetteer.datasets('Lidl Walworth Road', gaz);

    await searched(xhr);

    expect(JSON.parse(searchParams(xhr).get('filter'))).toEqual({
      retailer: { in: ['Aldi'] },
    });

    // The Lidl store is not an Aldi store.
    expect(rows(gaz.list)).toEqual([['Grocery', mapp.dictionary.no_results]]);
  });

  it('adds a row with the no_result text of the gazetteer without results', async () => {
    const mapview = await grocery();

    const xhr = spyXhr();

    const gaz = gazetteer(mapview, {
      layer: 'retail_points',
      qterm: 'store_name',
      title: 'Stores',
      no_result: 'No stores',
    });

    mapp.utils.gazetteer.datasets('No store has this name', gaz);

    await searched(xhr);

    expect(rows(gaz.list)).toEqual([['Stores', 'No stores']]);
  });

  it('does not add a row without results if the no_result is null', async () => {
    const mapview = await grocery();

    const xhr = spyXhr();

    const gaz = gazetteer(mapview, {
      layer: 'retail_points',
      qterm: 'store_name',
      no_result: null,
    });

    mapp.utils.gazetteer.datasets('No store has this name', gaz);

    await searched(xhr);

    expect(searches(xhr)).toHaveLength(1);
    expect(gaz.list.children).toHaveLength(0);
  });

  it('does not add rows if the input has been cleared', async () => {
    const mapview = await grocery();

    const xhr = spyXhr();

    const gaz = gazetteer(mapview, {
      layer: 'retail_points',
      qterm: 'store_name',
    });

    mapp.utils.gazetteer.datasets('Lidl Walworth Road', gaz);

    gaz.input.value = '';

    await searched(xhr);

    expect(searches(xhr)).toHaveLength(1);
    expect(gaz.list.children).toHaveLength(0);
  });

  it('does not search the gazetteer layer without a qterm', async () => {
    const mapview = await grocery();

    const xhr = spyXhr();

    mapp.utils.gazetteer.datasets(
      'Lidl',
      gazetteer(mapview, { layer: 'retail_points' }),
    );

    expect(searches(xhr)).toHaveLength(0);
  });

  it('searches the datasets with the gazetteer config', async () => {
    const mapview = await grocery();

    const xhr = spyXhr();

    const gaz = gazetteer(mapview, {
      layer: 'retail_points',
      qterm: 'store_name',
      limit: 2,
      datasets: [{ qterm: 'postcode', title: 'Postcode' }],
    });

    mapp.utils.gazetteer.datasets('SE17', gaz);

    await searched(xhr);

    // The gazetteer and the dataset are searched.
    expect(searches(xhr)).toHaveLength(2);

    const [dataset] = gaz.datasets;

    // The dataset has the gazetteer config, with its own qterm and title.
    expect(dataset.mapview).toBe(mapview);
    expect(dataset.list).toBe(gaz.list);
    expect(dataset.layer).toBe('retail_points');

    expect(searchParams(xhr, 0).get('qterm')).toBe('store_name');
    expect(searchParams(xhr, 1).get('qterm')).toBe('postcode');
    expect(searchParams(xhr, 1).get('limit')).toBe('2');

    const postcodes = rows(gaz.list).filter(([label]) => label === 'Postcode');

    expect(postcodes).toHaveLength(2);

    postcodes.forEach(([, postcode]) => expect(postcode).toMatch(/^SE17/));
  });

  it('only searches the datasets of a gazetteer with a provider', async () => {
    const mapview = await grocery();

    const xhr = spyXhr();

    const gaz = gazetteer(mapview, {
      provider: 'GOOGLE',
      layer: 'retail_points',
      qterm: 'store_name',
      datasets: [{ qterm: 'postcode', title: 'Postcode' }],
    });

    mapp.utils.gazetteer.datasets('SE17 2TG', gaz);

    await searched(xhr);

    expect(searches(xhr)).toHaveLength(1);
    expect(searches(xhr)[0]).toBe(gaz.datasets[0]);
    expect(rows(gaz.list)).toContainEqual(['Postcode', 'SE17 2TG']);
  });

  it('warns and does not search a layer which is not in the mapview', async () => {
    const mapview = await grocery();

    const xhr = spyXhr();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    mapp.utils.gazetteer.datasets(
      'Lidl',
      gazetteer(mapview, { layer: 'unknown', qterm: 'store_name' }),
    );

    expect(warn).toHaveBeenCalledExactlyOnceWith(
      'No layer definition for gazetteer search.',
    );
    expect(searches(xhr)).toHaveLength(0);
  });

  it('warns and does not search without a table', async () => {
    const mapview = await grocery();

    const xhr = spyXhr();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    delete mapview.layers.retail_points.table;

    mapp.utils.gazetteer.datasets(
      'Lidl',
      gazetteer(mapview, { layer: 'retail_points', qterm: 'store_name' }),
    );

    expect(warn).toHaveBeenCalledExactlyOnceWith(
      'No table definition for gazetteer search.',
    );
    expect(searches(xhr)).toHaveLength(0);
  });

  it('calls the gazetteer callback with the row of a clicked result', async () => {
    const mapview = await grocery();

    const xhr = spyXhr();

    const callback = vi.fn();

    const gaz = gazetteer(mapview, {
      layer: 'retail_points',
      qterm: 'store_name',
      callback,
    });

    mapp.utils.gazetteer.datasets('Lidl Walworth Road', gaz);

    await searched(xhr);

    gaz.list.firstElementChild.click();

    expect(callback).toHaveBeenCalledExactlyOnceWith(
      { id: String(LIDL), label: 'Lidl Walworth Road' },
      gaz,
    );

    // The location is not requested.
    expect(mapview.locations).toEqual({});
  });

  it('gets the location of a clicked result', async () => {
    const mapview = await grocery();

    const xhr = spyXhr();

    const gaz = gazetteer(mapview, {
      layer: 'retail_points',
      qterm: 'store_name',
      maxZoom: 15,
    });

    mapp.utils.gazetteer.datasets('Lidl Walworth Road', gaz);

    await searched(xhr);

    gaz.list.firstElementChild.click();

    await expect
      .poll(() => mapview.locations[`retail_points!${LIDL}`], {
        timeout: 5000,
      })
      .toBeDefined();

    const location = mapview.locations[`retail_points!${LIDL}`];

    // The id of the gazetteer row is a string.
    expect(location.id).toBe(String(LIDL));
    expect(location.layer).toBe(mapview.layers.retail_points);
  });
});

describe('utils/gazetteer getLocation', () => {
  it('calls the gazetteer callback with the location', async () => {
    const mapview = await grocery();

    const callback = vi.fn();

    const location = { lat: 51.5, lng: -0.1, label: 'London' };

    mapp.utils.gazetteer.getLocation(location, { mapview, callback });

    expect(callback).toHaveBeenCalledExactlyOnceWith(location);

    // The location is not decorated or added to the mapview.
    expect(location).toEqual({ lat: 51.5, lng: -0.1, label: 'London' });
    expect(mapview.locations).toEqual({});
  });

  it('alerts for a location outside of the mapview extent', async () => {
    // The extent of the locale is Great Britain.
    const mapview = await grocery({
      extent: { north: 61, east: 2, south: 49, west: -9 },
    });

    const alert = vi.spyOn(mapp.utils, 'alert').mockImplementation(() => {});

    const location = { lat: 48.86, lng: 2.35, label: 'Paris' };

    mapp.utils.gazetteer.getLocation(location, { mapview });

    expect(alert).toHaveBeenCalledExactlyOnceWith({
      text: mapp.dictionary.invalid_lat_lon,
    });

    expect(location.infoj).toBeUndefined();
    expect(mapview.locations).toEqual({});
  });

  it('adds the location with a pin to the mapview', async () => {
    const mapview = await grocery();

    const alert = vi.spyOn(mapp.utils, 'alert').mockImplementation(() => {});

    const location = {
      lat: 51.5,
      lng: -0.1,
      label: 'London',
      source: 'Google',
    };

    mapp.utils.gazetteer.getLocation(location, {
      mapview,
      maxZoom: 12,
      buffer: 100,
    });

    expect(alert).not.toHaveBeenCalled();

    // The label is the hook of the location in the mapview.
    expect(location.hook).toBe('London');
    expect(mapview.locations.London).toBe(location);
    expect(location.layer.mapview).toBe(mapview);

    // The location has been decorated.
    expect(location.flyTo).toBeTypeOf('function');
    expect(location.remove).toBeTypeOf('function');

    const [title, pin] = location.infoj;

    expect(title).toMatchObject({
      inline: true,
      title: 'London',
      value: 'Google',
    });

    expect(pin).toMatchObject({
      type: 'pin',
      srid: '4326',
      value: [-0.1, 51.5],
      buffer: 100,
      class: 'display-none',
    });
  });
});
