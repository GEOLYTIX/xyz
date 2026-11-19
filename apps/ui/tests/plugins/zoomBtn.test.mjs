import { describe, expect, it } from 'vitest';
import plugins from '../../lib/plugins/_plugins.mjs';
import { zoomBtn } from '../../lib/plugins/zoomBtn.mjs';
import { addLayers, changeEnd, createMapview, getLocale } from '../helpers.mjs';

/**
Creates a rendered scratch mapview between the minZoom 9 and the maxZoom 11 without layers, with a mapButton element and the zoomBtn plugin.
*/
async function setup(z = 10) {
  const mapview = await createMapview(await getLocale('scratch'), {
    lat: 51.5,
    lng: -0.1,
    z,
    minZoom: 9,
    maxZoom: 11,
  });

  // The moveend event for the changeEnd callbacks requires a rendered map.
  await addLayers(mapview, []);

  mapview.mapButton = document.createElement('div');

  zoomBtn({}, mapview);

  return {
    btnZoomIn: mapview.mapButton.querySelector('[data-id=btnZoomIn]'),
    btnZoomOut: mapview.mapButton.querySelector('[data-id=btnZoomOut]'),
    mapview,
  };
}

describe('plugins/zoomBtn', () => {
  it('is in the plugins collection', () => {
    expect(plugins.zoomBtn).toBe(zoomBtn);
  });

  it('does nothing without a mapview or mapButton', () => {
    expect(() => zoomBtn({})).not.toThrow();
    expect(() => zoomBtn({}, {})).not.toThrow();
  });

  it('adds enabled zoom buttons between the min and max zoom', async () => {
    const { btnZoomIn, btnZoomOut } = await setup();

    expect(btnZoomIn.title).toBe(mapp.dictionary.toolbar_zoom_in);
    expect(btnZoomOut.title).toBe(mapp.dictionary.toolbar_zoom_out);
    expect(btnZoomIn.disabled).toBe(false);
    expect(btnZoomOut.disabled).toBe(false);
  });

  it('disables the buttons at the max and min zoom', async () => {
    let { btnZoomIn, btnZoomOut } = await setup(11);

    expect(btnZoomIn.disabled).toBe(true);
    expect(btnZoomOut.disabled).toBe(false);

    ({ btnZoomIn, btnZoomOut } = await setup(9));

    expect(btnZoomIn.disabled).toBe(false);
    expect(btnZoomOut.disabled).toBe(true);
  });

  it('zooms in to the max zoom', async () => {
    const { btnZoomIn, btnZoomOut, mapview } = await setup();

    const end = changeEnd(mapview);

    btnZoomIn.click();

    expect(mapview.Map.getView().getZoom()).toBe(11);
    expect(btnZoomIn.disabled).toBe(true);

    await end;

    expect(btnZoomIn.disabled).toBe(true);
    expect(btnZoomOut.disabled).toBe(false);
  });

  it('zooms out to the min zoom', async () => {
    const { btnZoomIn, btnZoomOut, mapview } = await setup();

    const end = changeEnd(mapview);

    btnZoomOut.click();

    expect(mapview.Map.getView().getZoom()).toBe(9);
    expect(btnZoomOut.disabled).toBe(true);

    await end;

    expect(btnZoomIn.disabled).toBe(false);
    expect(btnZoomOut.disabled).toBe(true);
  });

  it('enables the zoom in button on changeEnd after zooming out', async () => {
    const { btnZoomIn, mapview } = await setup(11);

    expect(btnZoomIn.disabled).toBe(true);

    const end = changeEnd(mapview);

    mapview.Map.getView().setZoom(10);

    await end;

    expect(btnZoomIn.disabled).toBe(false);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3112: the click handler sets the disabled flag of the event target. A click on the icon span sets the flag on the span instead of the button. The button is only disabled with the changeEnd callback.
  it.fails('disables the button from a click on the icon', async () => {
    const { btnZoomIn, mapview } = await setup();

    btnZoomIn.querySelector('span').click();

    expect(mapview.Map.getView().getZoom()).toBe(11);
    expect(btnZoomIn.disabled).toBe(true);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3119: the Number.parseInt of the new zoom floors a fractional zoom. A zoom out from 10.5 zooms to 9, by 1.5 levels, and a zoom in zooms by 0.5 levels.
  it.fails(
    'zooms out by at most one level from a fractional zoom',
    async () => {
      const { btnZoomOut, mapview } = await setup(10.5);

      btnZoomOut.click();

      expect(10.5 - mapview.Map.getView().getZoom()).toBeLessThanOrEqual(1);
    },
  );
});
