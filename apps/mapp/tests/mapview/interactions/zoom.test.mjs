import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  createMapview,
  getLocale,
  pixelPosition,
  pointerClick,
} from '../../helpers.mjs';

/**
Creates the smoke mapview without layers.
*/
async function mapview() {
  const locale = await getLocale('smoke');

  return createMapview(locale, { lat: 51.5, lng: -0.1, z: 10 });
}

function mapInteractions(view) {
  return view.Map.getInteractions().getArray();
}

function mapLayers(view) {
  return view.Map.getLayers().getArray();
}

describe('mapview interactions zoom', () => {
  it('assigns the zoom interaction to the mapview', async () => {
    const view = await mapview();

    const callback = vi.fn();

    view.interactions.zoom({ callback });

    expect(view.interaction.callback).toBe(callback);
    expect(view.interaction.interaction).toBeInstanceOf(ol.interaction.Draw);
    expect(mapInteractions(view)).toContain(view.interaction.interaction);
    expect(mapLayers(view)).toContain(view.interaction.Layer);
    expect(view.Map.getTargetElement().style.cursor).toBe('zoom-in');
  });

  it('finishes the current interaction', async () => {
    const view = await mapview();

    const finish = vi.fn();

    view.interaction = { finish };

    view.interactions.zoom({});

    expect(finish).toHaveBeenCalledTimes(1);
  });

  it('fits the view to the box drawn with two clicks', async () => {
    const view = await mapview();

    const fitView = vi.spyOn(view, 'fitView').mockImplementation(() => {});

    const callback = vi.fn();

    view.interactions.zoom({ callback });

    const { interaction, Layer } = view.interaction;

    pointerClick(view, [100, 100]);

    // The first click starts the box.
    expect(fitView).not.toHaveBeenCalled();

    pointerClick(view, [300, 250]);

    const [minX, maxY] = view.Map.getCoordinateFromPixel([100, 100]);
    const [maxX, minY] = view.Map.getCoordinateFromPixel([300, 250]);

    expect(fitView).toHaveBeenCalledTimes(1);

    const extent = fitView.mock.calls[0][0];

    expect(extent[0]).toBeCloseTo(minX, 3);
    expect(extent[1]).toBeCloseTo(minY, 3);
    expect(extent[2]).toBeCloseTo(maxX, 3);
    expect(extent[3]).toBeCloseTo(maxY, 3);

    // The interaction is finished after the box is drawn.
    expect(mapInteractions(view)).not.toContain(interaction);
    expect(mapLayers(view)).not.toContain(Layer);
    expect(view.Map.getTargetElement().style.cursor).toBe('auto');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('removes the interaction and layer on finish', async () => {
    const view = await mapview();

    view.interactions.zoom({});

    const { interaction, Layer } = view.interaction;

    view.interaction.finish();

    expect(mapInteractions(view)).not.toContain(interaction);
    expect(mapLayers(view)).not.toContain(Layer);
    expect(view.Map.getTargetElement().style.cursor).toBe('auto');
  });

  it('fits the view to a box drawn with real input', async () => {
    const view = await mapview();

    const fitView = vi.spyOn(view, 'fitView').mockImplementation(() => {});

    view.interactions.zoom({});

    const target = view.Map.getTargetElement();

    await userEvent.click(target, { position: pixelPosition([100, 100]) });
    await userEvent.click(target, { position: pixelPosition([300, 250]) });

    expect(fitView).toHaveBeenCalledTimes(1);

    const [minX, minY, maxX, maxY] = fitView.mock.calls[0][0];

    const [left, top] = view.Map.getPixelFromCoordinate([minX, maxY]);
    const [right, bottom] = view.Map.getPixelFromCoordinate([maxX, minY]);

    // The position of a real input is within a pixel of the position.
    expect(Math.abs(left - 100)).toBeLessThan(2);
    expect(Math.abs(top - 100)).toBeLessThan(2);
    expect(Math.abs(right - 300)).toBeLessThan(2);
    expect(Math.abs(bottom - 250)).toBeLessThan(2);
  });
});
