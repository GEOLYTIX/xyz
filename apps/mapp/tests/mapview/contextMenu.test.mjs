import { describe, expect, it, vi } from 'vitest';
import contextMenu from '../../lib/mapview/contextMenu.mjs';
import { createMapview, getLocale } from '../helpers.mjs';

/**
Creates a mapview with a draw or modify interaction stub. The context menu methods are bound to the mapview by the interactions.
*/
async function mapview(vertices) {
  const locale = await getLocale('smoke');

  const view = await createMapview(locale, { lat: 51.5, lng: -0.1, z: 10 });

  const feature = { type: 'Feature' };

  view.interaction = {
    vertices,
    finish: vi.fn(),
    getFeature: () => feature,
  };

  return { view, feature };
}

const VERTICES = [
  [-11000, 6710000],
  [-12000, 6711000],
];

function menuItems(view) {
  return [...view.popup().querySelectorAll('ul > li')];
}

function popupPosition(view) {
  return view.Map.getOverlays().getArray().at(-1).getPosition();
}

describe('mapview contextMenu', () => {
  describe('modify', () => {
    it('shows save and cancel at the last vertex', async () => {
      const { view } = await mapview(VERTICES);

      const event = { preventDefault: vi.fn() };

      contextMenu.modify.call(view, event);

      expect(event.preventDefault).toHaveBeenCalled();

      expect(menuItems(view).map((li) => li.textContent.trim())).toEqual([
        mapp.dictionary.save,
        mapp.dictionary.cancel,
      ]);

      expect(popupPosition(view)).toEqual(VERTICES[1]);

      view.popup(null);
    });

    it('finishes the interaction with the feature on save', async () => {
      const { view, feature } = await mapview(VERTICES);

      contextMenu.modify.call(view);

      menuItems(view)[0].click();

      expect(view.interaction.finish).toHaveBeenCalledWith(feature);

      view.popup(null);
    });

    it('finishes the interaction without a feature on cancel', async () => {
      const { view } = await mapview(VERTICES);

      contextMenu.modify.call(view);

      menuItems(view)[1].click();

      expect(view.interaction.finish).toHaveBeenCalledWith();

      view.popup(null);
    });
  });

  describe('draw', () => {
    it('shows save and cancel at the last vertex after a timeout', async () => {
      vi.useFakeTimers();

      const { view, feature } = await mapview(VERTICES);

      contextMenu.draw.call(view);

      // The popup appears after the async onchange event popup.
      expect(view.popup()).toBeFalsy();

      vi.advanceTimersByTime(100);

      vi.useRealTimers();

      expect(popupPosition(view)).toEqual(VERTICES[1]);

      menuItems(view)[0].click();

      expect(view.interaction.finish).toHaveBeenCalledWith(feature);

      view.popup(null);
    });

    it('does not show a popup without vertices', async () => {
      vi.useFakeTimers();

      const { view } = await mapview([]);

      contextMenu.draw.call(view);

      vi.advanceTimersByTime(100);

      vi.useRealTimers();

      expect(view.popup()).toBeFalsy();
    });
  });
});
