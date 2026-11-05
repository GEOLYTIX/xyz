import { describe, expect, it, vi } from 'vitest';
import { createMapview, getLocale } from '../helpers.mjs';

// Lidl Walworth Road.
const POSITION = { coords: { longitude: '-0.094762', latitude: '51.486849' } };

async function mapview() {
  const locale = await getLocale('smoke');

  return createMapview({ ...locale, maxZoom: 17 }, { lat: 48, lng: 5, z: 4 });
}

function stubPosition() {
  return vi
    .spyOn(mapp.utils, 'getCurrentPosition')
    .mockImplementation((callback) => callback(POSITION));
}

describe('mapview locate', () => {
  it('adds the locator at the current position and animates the view', async () => {
    const view = await mapview();

    stubPosition();

    const animate = vi.spyOn(view.Map.getView(), 'animate');

    view.locate();

    expect(view._locate.active).toBe(true);
    expect(view.Map.getLayers().getArray()).toContain(view._locate.L);
    expect(view._locate.L.getZIndex()).toBe(999);

    const coords = ol.proj.fromLonLat([-0.094762, 51.486849]);

    expect(view._locate.feature.getGeometry().getCoordinates()).toEqual(coords);
    expect(animate).toHaveBeenCalledWith({ center: coords, zoom: 17 });

    vi.restoreAllMocks();
  });

  it('removes the locator on the second call', async () => {
    const view = await mapview();

    const getCurrentPosition = stubPosition();

    view.locate();

    const L = view._locate.L;

    view.locate();

    expect(view._locate.active).toBe(false);
    expect(view.Map.getLayers().getArray()).not.toContain(L);

    // The position is only requested for the active locator.
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);

    // The locator layer is reused.
    view.locate();

    expect(view._locate.L).toBe(L);

    vi.restoreAllMocks();
  });

  it('assigns the params on the first call', async () => {
    const view = await mapview();

    stubPosition();

    const icon = { type: 'dot', fillColor: '#f00' };

    view.locate({ icon });

    expect(view._locate.icon).toBe(icon);

    vi.restoreAllMocks();
  });

  it('has the host locator svg as default icon', async () => {
    const view = await mapview();

    stubPosition();

    view.locate();

    expect(view._locate.icon).toMatchObject({
      scale: 0.05,
      svg: `${mapp.host}/icons/locator.svg`,
    });

    vi.restoreAllMocks();
  });
});
