import { describe, expect, it, vi } from 'vitest';
import { entry, lidlLocation } from '../../helpers.mjs';

describe('ui/locations/entries/pin', () => {
  it('displays the pin of the location on the map', async () => {
    const { location, mapview } = await lidlLocation();

    const pin = entry(location, 'pin');

    expect(pin.display).toBe(true);
    expect(pin.srid).toBe('4326');
    expect(pin.geometry).toEqual({ coordinates: pin.value, type: 'Point' });
    expect(pin.Style).toBe(location.pinStyle);
    expect(location.Layers).toContain(pin);
    expect(mapview.Map.getLayers().getArray()).toContain(pin.L);

    // The pin feature is the store in the mapview projection.
    const coordinates = pin.L.getSource()
      .getFeatures()[0]
      .getGeometry()
      .getCoordinates();

    ol.proj
      .fromLonLat(pin.value)
      .forEach((coord, i) => expect(coordinates[i]).toBeCloseTo(coord, 0));
  });

  it('creates a checked checkbox with the pin label', async () => {
    const { location } = await lidlLocation();

    const pin = entry(location, 'pin');

    expect(pin.chkbox.parentElement).toBe(pin.node);
    expect(pin.chkbox.querySelector('input').checked).toBe(true);
    expect(pin.chkbox.textContent.trim()).toBe(mapp.dictionary.pin);
  });

  it('hides and shows the pin with the checkbox', async () => {
    const { location, mapview } = await lidlLocation();

    const pin = entry(location, 'pin');

    const input = pin.chkbox.querySelector('input');

    const L = pin.L;

    input.click();

    expect(pin.display).toBe(false);
    expect(location.Layers).not.toContain(pin);
    expect(mapview.Map.getLayers().getArray()).not.toContain(L);

    input.click();

    expect(pin.display).toBe(true);
    expect(location.Layers).toContain(pin);
    expect(mapview.Map.getLayers().getArray()).toContain(pin.L);
  });

  it('does not display a pin with a false display flag', async () => {
    const { location } = await lidlLocation((layers) => {
      const pin = layers.retail_points.infoj[1];

      pin.display = false;
      pin.label = 'Store';
    });

    const pin = entry(location, 'pin');

    expect(pin.L).toBeUndefined();
    expect(location.Layers).toEqual([]);
    expect(pin.chkbox.querySelector('input').checked).toBe(false);
    expect(pin.chkbox.textContent.trim()).toBe('Store');
  });

  it('returns the buffered extent of the pin', async () => {
    const { location } = await lidlLocation();

    const pin = entry(location, 'pin');

    const [x, y] = ol.proj.fromLonLat(pin.value);

    const extent = pin.getExtent();

    // The default buffer is 200.
    expect(pin.buffer).toBe(200);
    expect(extent[0]).toBeCloseTo(x - 200, 0);
    expect(extent[3]).toBeCloseTo(y + 200, 0);
  });

  it('warns and returns without a value array', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { location } = await lidlLocation();

    const pin = { location, value: null };

    expect(mapp.ui.locations.entries.pin(pin)).toBeUndefined();
    expect(warn).toHaveBeenCalledWith('Entry type pin requires a value array.');

    warn.mockRestore();
  });
});
