import { afterEach, describe, expect, it, vi } from 'vitest';
import plugins from '../../lib/plugins/_plugins.mjs';
import { fullscreen } from '../../lib/plugins/fullscreen.mjs';
import { createMapview, getLocale } from '../helpers.mjs';

afterEach(() => {
  document.body.classList.remove('fullscreen');
});

/**
Creates a scratch mapview with a mapButton element and the fullscreen plugin.
*/
async function setup() {
  const mapview = await createMapview(await getLocale('scratch'));

  mapview.mapButton = document.createElement('div');

  fullscreen({}, mapview);

  return {
    btn: mapview.mapButton.querySelector('[data-id=fullscreen]'),
    mapview,
  };
}

describe('plugins/fullscreen', () => {
  it('is in the plugins collection', () => {
    expect(plugins.fullscreen).toBe(fullscreen);
  });

  it('does nothing without a mapButton', () => {
    expect(() => fullscreen({}, {})).not.toThrow();
  });

  it('toggles the fullscreen class of the document body', async () => {
    const { btn, mapview } = await setup();

    expect(btn.title).toBe(mapp.dictionary.toolbar_fullscreen);

    const updateSize = vi.spyOn(mapview.Map, 'updateSize');

    // A mapbox layer is resized with the map.
    const resize = vi.fn();
    mapview.layers.mapbox = { mbMap: { resize } };

    btn.click();

    expect(btn.classList.contains('active')).toBe(true);
    expect(document.body.classList.contains('fullscreen')).toBe(true);
    expect(updateSize).toHaveBeenCalledTimes(1);
    expect(resize).toHaveBeenCalledTimes(1);

    btn.click();

    expect(btn.classList.contains('active')).toBe(false);
    expect(document.body.classList.contains('fullscreen')).toBe(false);
    expect(updateSize).toHaveBeenCalledTimes(2);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3112: the click handler toggles the active class of the event target. A click on the icon span toggles the class on the span instead of the button.
  it.fails(
    'toggles the button active class from a click on the icon',
    async () => {
      const { btn } = await setup();

      btn.querySelector('span').click();

      expect(document.body.classList.contains('fullscreen')).toBe(true);
      expect(btn.classList.contains('active')).toBe(true);
    },
  );
});
