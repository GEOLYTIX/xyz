import { describe, expect, it, onTestFinished, vi } from 'vitest';
import plugins from '../../lib/plugins/_plugins.mjs';
import { zoomToArea } from '../../lib/plugins/zoomToArea.mjs';
import { createMapview, getLocale } from '../helpers.mjs';

/**
Creates a scratch mapview with a mapButton element and the zoomToArea plugin. The highlight interaction is spied on.
*/
async function setup() {
  const mapview = await createMapview(await getLocale('scratch'));

  mapview.mapButton = document.createElement('div');

  zoomToArea({}, mapview);

  return {
    btn: mapview.mapButton.querySelector('[data-id=zoomtoarea]'),
    highlight: vi.spyOn(mapview.interactions, 'highlight'),
    mapview,
  };
}

/**
Uses fake timers for the 400ms timeout of the zoom interaction callback.
*/
function fakeTimers() {
  vi.useFakeTimers();

  onTestFinished(() => {
    vi.useRealTimers();
  });
}

describe('plugins/zoomToArea', () => {
  it('is in the plugins collection', () => {
    expect(plugins.zoomToArea).toBe(zoomToArea);
  });

  it('does nothing without a mapButton', () => {
    expect(() => zoomToArea({}, {})).not.toThrow();
  });

  it('starts a zoom interaction', async () => {
    const { btn, mapview } = await setup();

    expect(btn.title).toBe(mapp.dictionary.toolbar_zoom_to_area);

    const zoom = vi.spyOn(mapview.interactions, 'zoom');

    btn.click();

    expect(btn.classList.contains('active')).toBe(true);
    expect(zoom).toHaveBeenCalledTimes(1);
    expect(mapview.interaction.interaction).toBeInstanceOf(ol.interaction.Draw);
    expect(mapview.Map.getTargetElement().style.cursor).toBe('zoom-in');
  });

  it('starts the highlight interaction 400ms after the zoom interaction finished', async () => {
    const { btn, highlight, mapview } = await setup();

    fakeTimers();

    btn.click();

    mapview.interaction.finish();

    expect(btn.classList.contains('active')).toBe(false);
    expect(mapview.interaction).toBeUndefined();
    expect(mapview.Map.getTargetElement().style.cursor).toBe('auto');

    vi.advanceTimersByTime(399);

    expect(highlight).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(highlight).toHaveBeenCalledTimes(1);
    expect(mapview.interaction.type).toBe('highlight');
  });

  it('does not start the highlight interaction if another interaction is current', async () => {
    const { btn, highlight, mapview } = await setup();

    fakeTimers();

    btn.click();

    mapview.interaction.finish();

    // Another interaction becomes current before the timeout.
    mapview.interaction = { finish: () => {} };

    vi.advanceTimersByTime(400);

    expect(highlight).not.toHaveBeenCalled();
  });

  it('cancels the zoom interaction with a second click', async () => {
    const { btn, highlight, mapview } = await setup();

    fakeTimers();

    btn.click();

    btn.click();

    // The highlight interaction finishes the zoom interaction, which removes the active class in its callback.
    expect(highlight).toHaveBeenCalledTimes(1);
    expect(btn.classList.contains('active')).toBe(false);
    expect(mapview.interaction.type).toBe('highlight');

    // The highlight interaction is current after the timeout.
    vi.advanceTimersByTime(400);

    expect(highlight).toHaveBeenCalledTimes(1);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3112: the click handler toggles the active class of the event target. A click on the icon span adds the class to the span instead of the button.
  it.fails(
    'adds the button active class from a click on the icon',
    async () => {
      const { btn } = await setup();

      btn.querySelector('span').click();

      expect(btn.classList.contains('active')).toBe(true);
    },
  );
});
