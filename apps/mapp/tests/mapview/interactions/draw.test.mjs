import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  createMapview,
  getLocale,
  pixelPosition,
  pointerClick,
  pointerEvent,
} from '../../helpers.mjs';

/**
Creates the smoke mapview without layers.

A draw interaction which is not finished by the test is finished before the map is disposed, because the interaction has a keyup listener on the document.
*/
async function mapview() {
  const locale = await getLocale('smoke');

  const view = await createMapview(locale, { lat: 51.5, lng: -0.1, z: 10 });

  onTestFinished(() => {
    if (mapInteractions(view).includes(view.interaction?.interaction)) {
      view.interaction.finish();
    }
  });

  return view;
}

// The pixels of a triangle. A click on the first pixel closes the polygon.
const TRIANGLE = [
  [100, 100],
  [300, 100],
  [300, 300],
];

/**
Draws a polygon with a click on each pixel and a click on the first pixel.
*/
function drawPolygon(view, pixels = TRIANGLE) {
  for (const pixel of [...pixels, pixels[0]]) {
    pointerClick(view, pixel);
  }
}

function coordinates(view, pixels) {
  return pixels.map((pixel) => view.Map.getCoordinateFromPixel(pixel));
}

function mapInteractions(view) {
  return view.Map.getInteractions().getArray();
}

function mapLayers(view) {
  return view.Map.getLayers().getArray();
}

function menuItems(view) {
  return [...view.popup().querySelectorAll('ul > li')];
}

describe('mapview interactions draw', () => {
  it('assigns the draw interaction to the mapview', async () => {
    const view = await mapview();

    const finish = vi.fn();

    view.interaction = { finish };

    const snap = vi.spyOn(view.interactions, 'snap');

    view.interactions.draw({ type: 'Polygon' });

    // The current interaction is finished.
    expect(finish).toHaveBeenCalledTimes(1);

    expect(view.interaction.type).toBe('Polygon');
    expect(view.interaction.vertices).toEqual([]);
    expect(view.interaction.interaction).toBeInstanceOf(ol.interaction.Draw);
    expect(mapInteractions(view)).toContain(view.interaction.interaction);

    // The layer for the drawn feature is added to the map.
    expect(mapLayers(view)).toContain(view.interaction.Layer);
    expect(view.interaction.Layer.getSource()).toBe(view.interaction.source);
    expect(view.interaction.Layer.getZIndex()).toBe(99);

    expect(view.Map.getTargetElement().style.cursor).toBe('crosshair');

    expect(snap).toHaveBeenCalledWith(view);
  });

  it('assigns the zIndex of the layer param to the draw layer', async () => {
    const view = await mapview();

    view.interactions.draw({ type: 'Point', layer: { zIndex: 7 } });

    expect(view.interaction.Layer.getZIndex()).toBe(7);
  });

  it('adds a vertex with a left click', async () => {
    const view = await mapview();

    const condition = vi.fn();

    view.interactions.draw({
      type: 'LineString',
      // A condition which is not a function is ignored.
      conditions: [condition, 'condition'],
    });

    view.popup({ content: document.createElement('div') });

    pointerClick(view, [100, 100]);
    pointerClick(view, [300, 100]);

    expect(view.interaction.vertices).toEqual(
      coordinates(view, [
        [100, 100],
        [300, 100],
      ]),
    );

    // The conditions are called with the event.
    expect(condition).toHaveBeenCalledTimes(2);
    expect(condition.mock.calls[0][0].type).toBe('pointerdown');

    // A click removes the popup.
    expect(view.popup()).toBeFalsy();
  });

  it('removes the last vertex with a right click', async () => {
    const view = await mapview();

    const condition = vi.fn();

    view.interactions.draw({ type: 'LineString', conditions: [condition] });

    pointerClick(view, [100, 100]);
    pointerClick(view, [300, 100]);

    const removeLastPoint = vi.spyOn(
      view.interaction.interaction,
      'removeLastPoint',
    );

    pointerEvent(view, 'pointerdown', [300, 300], { button: 2, buttons: 2 });
    pointerEvent(view, 'pointerup', [300, 300], { button: 2 });

    expect(removeLastPoint).toHaveBeenCalledTimes(1);
    expect(view.interaction.vertices).toEqual(coordinates(view, [[100, 100]]));
    expect(condition).toHaveBeenCalledTimes(3);
  });

  it('does not add a vertex while the interaction waits', async () => {
    const view = await mapview();

    view.interactions.draw({ type: 'LineString' });

    view.interaction.wait = true;

    pointerClick(view, [100, 100]);

    expect(view.interaction.vertices).toEqual([]);
  });

  it('calls the drawend method with the drawn feature', async () => {
    const view = await mapview();

    const drawend = vi.fn();

    view.interactions.draw({ type: 'Polygon', drawend });

    drawPolygon(view);

    expect(drawend).toHaveBeenCalledTimes(1);

    const { feature } = drawend.mock.calls[0][0];

    expect(feature.getGeometry().getType()).toBe('Polygon');

    // The polygon ring is closed with the first coordinate.
    expect(feature.getGeometry().getCoordinates()[0]).toEqual(
      coordinates(view, [...TRIANGLE, TRIANGLE[0]]),
    );

    // The feature is added to the source of the draw layer.
    expect(view.interaction.source.getFeatures()).toEqual([feature]);
    expect(view.interaction.vertices).toHaveLength(4);
  });

  it('clears the source and the popup when a drawing starts', async () => {
    const view = await mapview();

    view.interactions.draw({ type: 'Polygon', drawend: vi.fn() });

    drawPolygon(view);

    expect(view.interaction.source.getFeatures()).toHaveLength(1);

    view.popup({ content: document.createElement('div') });

    pointerClick(view, [400, 400]);

    expect(view.interaction.source.getFeatures()).toEqual([]);
    expect(view.popup()).toBeFalsy();
  });

  it('shows the metric of the geometry in a tooltip popup', async () => {
    const view = await mapview();

    view.interactions.draw({
      type: 'LineString',
      tooltip: { metric: 'length', suffix: 'm' },
    });

    pointerClick(view, [100, 100]);

    // Openlayers checks the first pointermove after a click for a drag.
    pointerEvent(view, 'pointermove', [200, 100]);
    pointerEvent(view, 'pointermove', [300, 100]);

    const length = ol.sphere.getLength(
      new ol.geom.LineString(
        coordinates(view, [
          [100, 100],
          [300, 100],
        ]),
      ),
    );

    // The convert method is async.
    await vi.waitFor(() =>
      expect(view.popup().textContent.trim()).toBe(`${length.toFixed(0)}m`),
    );
  });

  it('calls the onChange method of the tooltip', async () => {
    const view = await mapview();

    const onChange = vi.fn();

    view.interactions.draw({ type: 'LineString', tooltip: { onChange } });

    pointerClick(view, [100, 100]);

    // Openlayers checks the first pointermove after a click for a drag.
    pointerEvent(view, 'pointermove', [200, 100]);
    pointerEvent(view, 'pointermove', [300, 100]);

    expect(onChange).toHaveBeenCalled();
    expect(view.popup()).toBeFalsy();
  });

  it('shows the context menu to save the drawn feature', async () => {
    const view = await mapview();

    const callback = vi.fn();

    view.interactions.draw({ type: 'Polygon', callback });

    const { interaction, Layer } = view.interaction;

    view.Map.renderSync();

    // The popup pans the map, which changes the coordinates of the pixels.
    const ring = coordinates(view, [...TRIANGLE, TRIANGLE[0]]);

    drawPolygon(view);

    // The context menu popup is shown after a timeout.
    await vi.waitFor(() => expect(view.popup()).toBeTruthy());

    const items = menuItems(view);

    expect(items.map((li) => li.textContent.trim())).toEqual([
      mapp.dictionary.save,
      mapp.dictionary.cancel,
    ]);

    items[0].click();

    // The interaction is finished with the feature as GeoJSON.
    expect(callback).toHaveBeenCalledTimes(1);

    const feature = callback.mock.calls[0][0];

    expect(feature.type).toBe('Feature');
    expect(feature.geometry.type).toBe('Polygon');
    expect(feature.geometry.coordinates[0]).toEqual(ring);

    expect(mapInteractions(view)).not.toContain(interaction);
    expect(mapLayers(view)).not.toContain(Layer);
    expect(view.popup()).toBeFalsy();
    expect(view.Map.getTargetElement().style.cursor).toBe('default');
  });

  it('gets the feature in the projection of the layer', async () => {
    const view = await mapview();

    view.interactions.draw({
      type: 'Point',
      drawend: vi.fn(),
      layer: { srid: '4326' },
    });

    pointerClick(view, [400, 300]);

    const [lng, lat] = view.interaction.getFeature().geometry.coordinates;

    // The pixel is the centre of the map view.
    expect(lng).toBeCloseTo(-0.1, 6);
    expect(lat).toBeCloseTo(51.5, 6);
  });

  // https://github.com/GEOLYTIX/xyz/issues/3086: the string concatenation had precedence over the logical or, so the srid param and the mapview srid were never used. Fixed by concatenating the first srid which is defined.
  it('gets the feature in the projection of the srid param', async () => {
    const view = await mapview();

    view.interactions.draw({ type: 'Point', drawend: vi.fn(), srid: '4326' });

    pointerClick(view, [400, 300]);

    const [lng, lat] = view.interaction.getFeature().geometry.coordinates;

    expect(lng).toBeCloseTo(-0.1, 6);
    expect(lat).toBeCloseTo(51.5, 6);
  });

  it('finishes the interaction on the escape key', async () => {
    const view = await mapview();

    const callback = vi.fn();

    view.interactions.draw({ type: 'Polygon', callback });

    const { interaction } = view.interaction;

    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));

    expect(callback).not.toHaveBeenCalled();

    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' }));

    // The interaction is finished without a feature.
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(undefined);
    expect(mapInteractions(view)).not.toContain(interaction);

    // The keyup listener is removed.
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' }));

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('removes the snap interaction on finish', async () => {
    const view = await mapview();

    view.interactions.draw({ type: 'Polygon' });

    const remove = vi.fn();

    view.interaction.snap = { remove };

    view.interaction.finish();

    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('draws a polygon with real input', async () => {
    const view = await mapview();

    const drawend = vi.fn();

    view.interactions.draw({ type: 'Polygon', drawend });

    const target = view.Map.getTargetElement();

    for (const pixel of [...TRIANGLE, TRIANGLE[0]]) {
      await userEvent.click(target, { position: pixelPosition(pixel) });
    }

    expect(drawend).toHaveBeenCalledTimes(1);
    expect(view.interaction.vertices).toHaveLength(4);

    const ring = drawend.mock.calls[0][0].feature
      .getGeometry()
      .getCoordinates()[0];

    expect(ring).toHaveLength(4);
  });
});
