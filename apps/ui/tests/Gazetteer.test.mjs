import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { groceryMapview } from './helpers.mjs';

/**
@function gazetteerTarget

@description
Returns a target element for the gazetteer searchbox. The target is removed when the test finishes.

@returns {HTMLElement} The target element.
*/
function gazetteerTarget() {
  const target = document.createElement('div');

  document.body.append(target);

  onTestFinished(() => target.remove());

  return target;
}

/**
@function stubGazetteerUtils

@description
Replaces the mapp.utils.gazetteer module namespace with a copy which has the stubs as properties. The module namespace can't be extended or spied on. The namespace is restored when the test finishes.

@param {Object} stubs The methods to assign to the copy.
@returns {Object} The copy of the gazetteer utils.
*/
function stubGazetteerUtils(stubs) {
  const utils = mapp.utils.gazetteer;

  mapp.utils.gazetteer = { ...utils, ...stubs };

  onTestFinished(() => {
    mapp.utils.gazetteer = utils;
  });

  return mapp.utils.gazetteer;
}

/**
@function search

@description
Sets the value of the searchbox input in the target and dispatches an input event.

@param {HTMLElement} target The gazetteer target.
@param {string} value The input value.
*/
function search(target, value) {
  const input = target.querySelector('input');

  input.value = value;

  input.dispatchEvent(new Event('input'));
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
Returns the text of the spans in each row of the result list.
*/
function rows(target) {
  return [...target.querySelector('ul').children].map((li) =>
    [...li.querySelectorAll('span')].map((span) => span.textContent),
  );
}

describe('ui/Gazetteer', () => {
  it('creates a searchbox in the target', () => {
    const target = gazetteerTarget();

    mapp.ui.Gazetteer({ target, placeholder: 'Search' });

    const input = target.querySelector('.searchbox > input');

    expect(input.name).toBe('gazetteer-search-input');
    expect(input.placeholder).toBe('Search');
    expect(target.querySelector('.searchbox > ul')).not.toBeNull();
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3108: the gazetteer method documents an @returns {Object}, but returns undefined. The searchbox input and list are assigned to a new object, and are not accessible to the caller.
  it.fails('returns the gazetteer object', () => {
    const gazetteer = mapp.ui.Gazetteer({ target: gazetteerTarget() });

    expect(gazetteer.list).toBeInstanceOf(HTMLUListElement);
  });

  it('clears the list and does not search an empty input', () => {
    const datasets = vi.fn();

    stubGazetteerUtils({ datasets });

    const target = gazetteerTarget();

    mapp.ui.Gazetteer({ target });

    target.querySelector('ul').append(document.createElement('li'));

    search(target, '');

    expect(rows(target)).toEqual([]);
    expect(datasets).not.toHaveBeenCalled();
  });

  it('adds a row for valid coordinates and gets the location on click', () => {
    const datasets = vi.fn();
    const getLocation = vi.fn();

    stubGazetteerUtils({ datasets, getLocation });

    const target = gazetteerTarget();

    const config = { target, maxZoom: 12 };

    mapp.ui.Gazetteer(config);

    search(target, '51.5, -0.1');

    expect(rows(target)).toEqual([['Latitude:51.5, Longitude:-0.1']]);

    // The datasets are not searched for coordinates.
    expect(datasets).not.toHaveBeenCalled();

    target.querySelector('li').click();

    expect(getLocation).toHaveBeenCalledOnce();

    const [location, gazetteer] = getLocation.mock.calls[0];

    expect(location).toEqual({
      label: 'Latitude:51.5, Longitude:-0.1',
      lat: 51.5,
      lng: -0.1,
      source: 'Coordinates',
    });

    // The gazetteer is a copy of the config with the searchbox elements.
    expect(gazetteer).not.toBe(config);
    expect(gazetteer.maxZoom).toBe(12);
    expect(gazetteer.list).toBe(target.querySelector('ul'));
  });

  it('adds an error row for coordinates out of range', () => {
    stubGazetteerUtils({ datasets: vi.fn() });

    const target = gazetteerTarget();

    mapp.ui.Gazetteer({ target });

    search(target, '100, 200');

    const [li] = target.querySelectorAll('li');

    expect(li.textContent.trim()).toBe(mapp.dictionary.invalid_lat_long_range);
    expect(li.style.color).toBe('red');
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3108: out of range coordinates are searched with the provider and in the datasets after the error row is added. The valid coordinates branch returns with the comment "Do not search if coordinates are provided". The list shows the error row and the no results rows of the datasets.
  it.fails('does not search coordinates out of range', () => {
    const datasets = vi.fn();

    stubGazetteerUtils({ datasets });

    const target = gazetteerTarget();

    mapp.ui.Gazetteer({ target });

    search(target, '100, 200');

    expect(datasets).not.toHaveBeenCalled();
  });

  it('warns for a provider which is not available and searches the datasets', () => {
    const datasets = vi.fn();

    stubGazetteerUtils({ datasets });

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const target = gazetteerTarget();

    mapp.ui.Gazetteer({ target, provider: 'UNKNOWN' });

    search(target, 'Walworth');

    expect(warn).toHaveBeenCalledExactlyOnceWith(
      'Requested gazetteer service not available',
    );

    expect(datasets).toHaveBeenCalledOnce();
    expect(datasets.mock.calls[0][0]).toBe('Walworth');
  });

  it('searches with the provider and the datasets', () => {
    const datasets = vi.fn();
    const TEST = vi.fn();

    stubGazetteerUtils({ datasets, TEST });

    const target = gazetteerTarget();

    mapp.ui.Gazetteer({ target, provider: 'TEST' });

    search(target, 'Walworth');

    expect(TEST).toHaveBeenCalledOnce();

    const [term, gazetteer] = TEST.mock.calls[0];

    expect(term).toBe('Walworth');
    expect(gazetteer.provider).toBe('TEST');
    expect(gazetteer.list).toBe(target.querySelector('ul'));

    // The datasets are searched with the same gazetteer.
    expect(datasets).toHaveBeenCalledExactlyOnceWith('Walworth', gazetteer);
  });

  it('searches the gazetteer layer for a term', async () => {
    const mapview = await groceryMapview();

    const xhr = vi.spyOn(mapp.utils, 'xhr');

    const target = gazetteerTarget();

    mapp.ui.Gazetteer({
      target,
      mapview,
      layer: 'retail_points',
      qterm: 'store_name',
    });

    search(target, 'Lidl Walworth Road');

    await searched(xhr);

    expect(searches(xhr)).toHaveLength(1);
    expect(rows(target)).toEqual([['Grocery', 'Lidl Walworth Road']]);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3108: the input is split at commas and each part is parsed with Number.parseFloat, which parses a leading number and ignores the rest. An address like "3, 5 High St" is taken for the coordinates 3, 5 and the datasets are not searched.
  it.fails('searches the datasets for an address with a comma', () => {
    const datasets = vi.fn();

    stubGazetteerUtils({ datasets });

    const target = gazetteerTarget();

    mapp.ui.Gazetteer({ target });

    search(target, '3, 5 High St');

    expect(datasets).toHaveBeenCalledOnce();
  });
});
