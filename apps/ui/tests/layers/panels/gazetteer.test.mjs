import { describe, expect, it } from 'vitest';
import { layersListview } from '../../helpers.mjs';

describe('ui/layers/panels/gazetteer', () => {
  it('adds a gazetteer search input to the layer view', async () => {
    const { layer } = await layersListview((layers) => {
      layers.retail_points.gazetteer = { placeholder: 'Search stores' };
    });

    const input = layer.view.querySelector('[name=gazetteer-search-input]');

    expect(input.placeholder).toBe('Search stores');

    // The gazetteer target is the panel in the layer view content.
    expect(input.closest('.layer-view > .content > div')).not.toBeNull();
  });
});
