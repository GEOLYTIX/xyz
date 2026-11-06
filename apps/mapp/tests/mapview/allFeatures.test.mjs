import { describe, expect, it, vi } from 'vitest';
import { addLayers, createMapview, getLocale } from '../helpers.mjs';

/**
Creates the grocery mapview with the highlight interaction. The allFeatures method is the highlight longClickMethod.
*/
async function mapview() {
  const locale = await getLocale('grocery');

  const view = await createMapview(locale, locale.view);

  await addLayers(view);

  view.interactions.highlight();

  return view;
}

/**
Returns the pixel of the cluster feature with the most stores.
*/
function largestClusterPixel(view) {
  const feature = view.layers.retail_points.cluster.source
    .getFeatures()
    .reduce((a, b) =>
      b.get('features').length > a.get('features').length ? b : a,
    );

  return {
    feature,
    pixel: view.Map.getPixelFromCoordinate(
      feature.getGeometry().getCoordinates(),
    ),
  };
}

function popupItems(view) {
  return [...(view.popup()?.querySelectorAll('ul.list > li') || [])];
}

describe('mapview allFeatures', () => {
  it('lists the features at the pixel in a popup', async () => {
    const view = await mapview();

    const { feature, pixel } = largestClusterPixel(view);

    view.allFeatures({ pixel }, view);

    const items = popupItems(view);

    expect(items.map((li) => li.textContent)).toContain(
      `retail_points [${feature.get('id')}]`,
    );

    view.popup(null);
  });

  it('gets the feature of a list item', async () => {
    const view = await mapview();

    const getFeature = vi.fn();

    view.interaction.getFeature = getFeature;

    const { feature, pixel } = largestClusterPixel(view);

    view.allFeatures({ pixel }, view);

    const item = popupItems(view).find(
      (li) => li.textContent === `retail_points [${feature.get('id')}]`,
    );

    item.click();

    expect(getFeature).toHaveBeenCalledWith(
      expect.objectContaining({
        F: feature,
        id: feature.get('id'),
        layer: view.layers.retail_points,
      }),
    );

    expect(view.popup()).toBeFalsy();
  });

  it('does not show a popup without features at the pixel', async () => {
    const view = await mapview();

    view.popup({ content: document.createElement('div') });

    // A pixel outside the map has no features.
    view.allFeatures({ pixel: [-100, -100] }, view);

    // The current popup is removed.
    expect(view.popup()).toBeFalsy();
  });

  it('only lists features of layers in the interaction layerFilter', async () => {
    const view = await mapview();

    view.interaction.layerFilter = (L) => L.get('key') !== 'retail_points';

    const { pixel } = largestClusterPixel(view);

    view.allFeatures({ pixel }, view);

    expect(view.popup()).toBeFalsy();
  });
});
