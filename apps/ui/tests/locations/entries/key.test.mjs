import { describe, expect, it } from 'vitest';
import { lidlLocation } from '../../helpers.mjs';

describe('ui/locations/entries/key', () => {
  it('creates an active button with the layer name', async () => {
    const { location } = await lidlLocation();

    const button = location.infoj[0].node.querySelector('button.layer-key');

    expect(button.textContent).toBe('Grocery');
    expect(button.title).toBe(mapp.dictionary.layer_visibility);
    expect(button.classList).toContain('active');
  });

  it('toggles the layer display', async () => {
    const { layer, location } = await lidlLocation();

    const button = location.infoj[0].node.querySelector('button.layer-key');

    button.click();

    expect(layer.display).toBe(false);
    expect(button.classList).not.toContain('active');

    button.click();

    await layer.loading;

    expect(layer.display).toBe(true);
    expect(button.classList).toContain('active');
  });

  it('hides the layer with the hideLayer flag', async () => {
    const { layer, location } = await lidlLocation((layers) => {
      layers.retail_points.infoj[0].hideLayer = true;
    });

    const button = location.infoj[0].node.querySelector('button.layer-key');

    expect(layer.display).toBe(false);
    expect(button.classList).not.toContain('active');
  });
});
