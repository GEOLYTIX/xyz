import { describe, expect, it } from 'vitest';
import { groceryMapview, layersListview } from '../helpers.mjs';

describe('ui/layers/drawLegend', () => {
  it('returns for a layer without a legend node', async () => {
    const mapview = await groceryMapview();

    const layer = mapview.layers.retail_points;

    mapp.ui.layers.drawLegend(layer);

    expect(layer.style.legend).toBeUndefined();

    // A tiles layer has no style.
    expect(() => mapp.ui.layers.drawLegend(mapview.layers.osm)).not.toThrow();
  });

  it('draws the legend of the current theme into the legend node', async () => {
    const { layer } = await layersListview();

    expect(layer.style.theme.type).toBe('categorized');
    expect(layer.style.legend.parentElement.dataset.id).toBe('layerTheme');
    expect(layer.view.contains(layer.style.legend)).toBe(true);
    expect(layer.style.legend.querySelector('[data-id=Tesco]')).toBeTruthy();
  });

  it('is registered once as a showCallbacks method by the style panel', async () => {
    const { layer } = await layersListview();

    mapp.ui.layers.panels.style(layer);

    expect(
      layer.showCallbacks.filter((fn) => fn === mapp.ui.layers.drawLegend)
        .length,
    ).toBe(1);
  });

  it('does not draw a theme before its distribution has been processed', async () => {
    const { layer } = await layersListview();

    const legend = layer.style.legend.innerHTML;

    // The distribution has been processed for the retailer theme object, not for its clone.
    layer.style.theme = {
      ...layer.style.theme,
      categories: [],
    };

    mapp.ui.layers.drawLegend(layer);

    expect(layer.style.legend.innerHTML).toBe(legend);
  });

  it('does not draw a theme without a legend method', async () => {
    const { layer } = await layersListview();

    const legend = layer.style.legend.innerHTML;

    layer.style.theme = { type: 'unknown' };

    mapp.ui.layers.drawLegend(layer);

    expect(layer.style.legend.innerHTML).toBe(legend);
  });
});
