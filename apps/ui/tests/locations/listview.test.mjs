import { afterEach, describe, expect, it, vi } from 'vitest';
import { LIDL, lidlLocation } from '../helpers.mjs';

/**
Gets the location of another store than the Lidl from the retail_points layer.
*/
async function otherLocation(layer) {
  const id = layer.source
    .getFeatures()
    .map((F) => F.get('id'))
    .find((id) => id !== LIDL);

  return mapp.location.get({ layer, id });
}

afterEach(() => {
  for (const node of document.querySelectorAll('dialog')) node.remove();
});

describe('ui/locations/listview', () => {
  it('assigns the default locations config to the locale', async () => {
    const { mapview, target } = await lidlLocation();

    const { locations } = mapview.locale;

    expect(locations.pinStyle).toEqual({
      anchor: [0.5, 1],
      scale: 3,
      type: 'markerLetter',
    });

    expect(locations.records.length).toBe(26);
    expect(locations.records[1]).toEqual({ symbol: 'B', colour: '#EC602D' });
    expect(locations.clearAll.parentElement).toBe(target);
    expect(locations.noLocations.textContent.trim()).toBe(
      mapp.dictionary.location_no_location_selected,
    );
  });

  it('assigns a record, style and view to a location', async () => {
    const { location, mapview, tabs, target } = await lidlLocation();

    const { locations } = mapview.locale;

    expect(mapview.locations[location.hook]).toBe(location);
    expect(location.record).toBe(locations.records[0]);
    expect(location.record).toEqual({
      symbol: 'A',
      colour: '#2E6F9E',
      hook: `retail_points!${LIDL}`,
    });

    // The record colour is the stroke and fill colour of the location style.
    expect(location.style).toEqual({
      fillColor: '#2E6F9E',
      fillOpacity: 0.1,
      strokeColor: '#2E6F9E',
    });

    expect(location.pinStyle).toBeTruthy();

    // The view is added after the clearAll button.
    expect(locations.clearAll.nextSibling).toBe(location.view);
    expect(location.view.parentElement).toBe(target);
    expect(locations.clearAll.style.display).toBe('block');
    expect(locations.noLocations.style.display).toBe('none');
    expect(tabs.locations.style.display).toBe('block');
  });

  it('adds a new location before the collapsed current locations', async () => {
    const { layer, location, mapview } = await lidlLocation();

    expect(location.view.classList).toContain('expanded');

    const other = await otherLocation(layer);

    expect(other.record.symbol).toBe('B');
    expect(mapview.locale.locations.clearAll.nextSibling).toBe(other.view);
    expect(other.view.nextSibling).toBe(location.view);
    expect(other.view.classList).toContain('expanded');
    expect(location.view.classList).not.toContain('expanded');
  });

  it('frees the record of a removed location', async () => {
    const { layer, location, mapview, tabs } = await lidlLocation();

    const { locations } = mapview.locale;

    const layersTab = vi.fn();

    tabs.layers.addEventListener('click', layersTab, { once: true });

    location.remove();

    await layer.loading;

    expect(mapview.locations[`retail_points!${LIDL}`]).toBeUndefined();
    expect(locations.records[0]).toEqual({ symbol: 'A', colour: '#2E6F9E' });
    expect(location.view.isConnected).toBe(false);

    // The listview is checked with a timeout after a location is removed.
    await vi.waitFor(() => expect(layersTab).toHaveBeenCalled());

    expect(locations.clearAll.style.display).toBe('none');
    expect(locations.noLocations.style.display).toBe('block');

    // The free record is assigned to the next location.
    const other = await otherLocation(layer);

    expect(other.record.symbol).toBe('A');
  });

  it('removes all locations with the clear all button', async () => {
    const { layer, location, mapview, target } = await lidlLocation();

    const other = await otherLocation(layer);

    mapview.locale.locations.clearAll.click();

    await layer.loading;

    expect(Object.keys(mapview.locations)).toEqual([]);
    expect(location.view.isConnected).toBe(false);
    expect(other.view.isConnected).toBe(false);
    expect(target.querySelectorAll('.location-view').length).toBe(0);
  });

  it('alerts if no record is free for a location', async () => {
    const { layer, mapview } = await lidlLocation((layers, locale) => {
      locale.listview_records = [{ symbol: '1', colour: '#000000' }];
    });

    expect(mapview.locale.locations.records.length).toBe(1);

    const other = await otherLocation(layer);

    expect(mapview.locations[other.hook]).toBeUndefined();
    expect(other.view).toBeUndefined();
    expect(document.querySelector('dialog[data-id=alert] p').textContent).toBe(
      mapp.dictionary.location_listview_full,
    );
  });
});
