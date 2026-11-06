import { describe, expect, it, vi } from 'vitest';
import { createMapview, getLocale } from '../helpers.mjs';

async function mapview() {
  const locale = await getLocale('smoke');

  return createMapview(locale, { lat: 0, lng: 0, z: 2 });
}

// London to Berlin in EPSG:3857.
const EXTENT = [-20000, 6710000, 1492000, 6894000];

describe('mapview fitView', () => {
  it('fits the view to the extent', async () => {
    const view = await mapview();

    view.fitView(EXTENT, { duration: 0, padding: [0, 0, 0, 0] });

    const extent = view.Map.getView().calculateExtent();

    // The view extent contains the fitted extent.
    expect(ol.extent.containsExtent(extent, EXTENT)).toBe(true);

    // The fitted extent fills the width or the height of the view.
    const ratio = Math.max(
      ol.extent.getWidth(EXTENT) / ol.extent.getWidth(extent),
      ol.extent.getHeight(EXTENT) / ol.extent.getHeight(extent),
    );

    expect(ratio).toBeCloseTo(1, 1);
  });

  it('applies the options to the view fit', async () => {
    const view = await mapview();

    const fit = vi.spyOn(view.Map.getView(), 'fit');

    view.fitView(EXTENT, { duration: 0, maxZoom: 5 });

    expect(fit).toHaveBeenCalledWith(EXTENT, {
      duration: 0,
      padding: [50, 50, 50, 50],
      maxZoom: 5,
    });

    expect(view.Map.getView().getZoom()).toBe(5);
  });

  it.each([
    ['undefined', undefined],
    ['an object', { west: 0 }],
    ['a NaN value', [0, 0, Number.NaN, 10]],
    ['an Infinity value', [0, 0, Infinity, 10]],
  ])('warns and does not fit the view with %s', async (_, extent) => {
    const view = await mapview();

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fit = vi.spyOn(view.Map.getView(), 'fit');

    view.fitView(extent);

    expect(warn).toHaveBeenCalledWith(
      'Attempted to call fitView method with invalid extent',
    );
    expect(fit).not.toHaveBeenCalled();

    warn.mockRestore();
  });
});
