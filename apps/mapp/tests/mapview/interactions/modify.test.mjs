import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  createMapview,
  getLocale,
  pixelPosition,
  pointerClick,
  pointerDrag,
} from '../../helpers.mjs';

// The pixels of the vertices of the modified line.
const LINE = [
  [100, 100],
  [300, 100],
  [300, 300],
];

function coordinates(view, pixels) {
  return pixels.map((pixel) => view.Map.getCoordinateFromPixel(pixel));
}

/**
Returns a square polygon ring from a top left pixel.
*/
function ring(view, [x, y], size = 100) {
  return coordinates(view, [
    [x, y],
    [x + size, y],
    [x + size, y + size],
    [x, y + size],
    [x, y],
  ]);
}

/**
Creates the smoke mapview with a modify interaction for a feature. The geometry method is called with the mapview and returns the geometry of the feature. The default is a line with three vertices.

The modifyend method is a mock, unless the test has params for the interaction. The default modifyend method shows the context menu.

The map is rendered for the Openlayers Modify interaction to detect the vertices.

A modify interaction which is not finished by the test is finished before the map is disposed, because the interaction has a keyup listener on the document.
*/
async function mapview(geometry, params = { modifyend: vi.fn() }) {
  const locale = await getLocale('smoke');

  const view = await createMapview(locale, { lat: 51.5, lng: -0.1, z: 10 });

  view.Map.renderSync();

  geometry ??= (view) => new ol.geom.LineString(coordinates(view, LINE));

  const Feature = new ol.Feature(geometry(view));

  view.interactions.modify({ Feature, ...params });

  view.Map.renderSync();

  onTestFinished(() => {
    if (mapInteractions(view).includes(view.interaction?.interaction)) {
      view.interaction.finish();
    }
  });

  return view;
}

function mapInteractions(view) {
  return view.Map.getInteractions().getArray();
}

function mapLayers(view) {
  return view.Map.getLayers().getArray();
}

function menuItems(view) {
  return [...(view.popup()?.querySelectorAll('ul > li') || [])];
}

function menuText(view) {
  return menuItems(view).map((li) => li.textContent.trim());
}

function popupPosition(view) {
  return view.Map.getOverlays().getArray().at(-1).getPosition();
}

describe('mapview interactions modify', () => {
  it('assigns the modify interaction to the mapview', async () => {
    const locale = await getLocale('smoke');

    const view = await createMapview(locale, { lat: 51.5, lng: -0.1, z: 10 });

    const finish = vi.fn();

    view.interaction = { finish };

    const snap = vi.spyOn(view.interactions, 'snap');

    const Feature = new ol.Feature(new ol.geom.Point([0, 0]));

    view.interactions.modify({ Feature });

    // The current interaction is finished.
    expect(finish).toHaveBeenCalledTimes(1);

    expect(view.interaction.type).toBe('modify');
    expect(view.interaction.vertices).toEqual([]);
    expect(view.interaction.interaction).toBeInstanceOf(ol.interaction.Modify);
    expect(mapInteractions(view)).toContain(view.interaction.interaction);

    // The feature is added to the source of the modify layer.
    expect(view.interaction.source.getFeatures()).toEqual([Feature]);
    expect(mapLayers(view)).toContain(view.interaction.Layer);
    expect(view.interaction.Layer.getSource()).toBe(view.interaction.source);
    expect(view.interaction.Layer.getStyle()).toBe(view.interaction.Style);
    expect(view.interaction.Layer.getZIndex()).toBe(Infinity);

    expect(view.Map.getTargetElement().style.cursor).toBe('crosshair');

    expect(snap).toHaveBeenCalledWith(view);

    view.interaction.finish();
  });

  it('modifies the geometry by dragging a vertex', async () => {
    const view = await mapview();

    view.popup({ content: document.createElement('div') });

    pointerDrag(view, LINE[1], [350, 50]);

    expect(view.interaction.Feature.getGeometry().getCoordinates()).toEqual(
      coordinates(view, [LINE[0], [350, 50], LINE[2]]),
    );

    expect(view.interaction.modifyend).toHaveBeenCalledTimes(1);

    // The popup is removed when the modification starts.
    expect(view.popup()).toBeFalsy();
  });

  it('shows the context menu to save the modified feature', async () => {
    const callback = vi.fn();

    // The default modifyend method is the modify context menu.
    const view = await mapview(null, { callback });

    const { interaction, Layer } = view.interaction;

    pointerDrag(view, LINE[1], [350, 50]);

    expect(menuText(view)).toEqual([
      mapp.dictionary.save,
      mapp.dictionary.cancel,
    ]);

    menuItems(view)[0].click();

    // The interaction is finished with the feature as GeoJSON.
    expect(callback).toHaveBeenCalledTimes(1);

    const feature = callback.mock.calls[0][0];

    expect(feature.type).toBe('Feature');
    expect(feature.geometry.type).toBe('LineString');
    expect(feature.geometry.coordinates).toEqual(
      coordinates(view, [LINE[0], [350, 50], LINE[2]]),
    );

    expect(mapInteractions(view)).not.toContain(interaction);
    expect(mapLayers(view)).not.toContain(Layer);
    expect(view.interaction.source.getFeatures()).toEqual([]);
    expect(view.popup()).toBeFalsy();
    expect(view.Map.getTargetElement().style.cursor).toBe('default');
  });

  it('gets the feature in the projection of the srid param', async () => {
    const view = await mapview(
      (view) => new ol.geom.Point(view.Map.getView().getCenter()),
      { modifyend: vi.fn(), srid: '4326' },
    );

    const [lng, lat] = view.interaction.getFeature().geometry.coordinates;

    expect(lng).toBeCloseTo(-0.1, 6);
    expect(lat).toBeCloseTo(51.5, 6);
  });

  it('gets the feature in the projection of the mapview', async () => {
    const view = await mapview(
      (view) => new ol.geom.Point(view.Map.getView().getCenter()),
    );

    expect(view.interaction.getFeature().geometry.coordinates).toEqual(
      view.Map.getView().getCenter(),
    );
  });

  it('finishes the interaction on the escape key', async () => {
    const callback = vi.fn();

    const view = await mapview(null, { callback, modifyend: vi.fn() });

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

    const remove = vi.fn();

    view.interaction.snap = { remove };

    view.interaction.finish();

    expect(remove).toHaveBeenCalledTimes(1);
  });

  describe('deleteCondition', () => {
    it('removes a vertex of a line from the delete vertex menu', async () => {
      const view = await mapview();

      // The single click on a vertex shows the menu.
      pointerClick(view, LINE[1]);

      expect(menuText(view)).toEqual([mapp.dictionary.delete_vertex]);
      expect(popupPosition(view)).toEqual(
        view.Map.getCoordinateFromPixel(LINE[1]),
      );

      menuItems(view)[0].click();

      expect(view.interaction.Feature.getGeometry().getCoordinates()).toEqual(
        coordinates(view, [LINE[0], LINE[2]]),
      );

      // The modifyend method is called for the save and cancel menu.
      expect(view.interaction.modifyend).toHaveBeenCalled();
      expect(view.interaction.vertices).toHaveLength(1);
    });

    it('is only handled for a singleclick', async () => {
      const view = await mapview();

      view.interaction.deleteCondition({
        type: 'click',
        coordinate: view.Map.getCoordinateFromPixel(LINE[1]),
      });

      expect(view.popup()).toBeFalsy();
    });

    it('does not show a menu for a point', async () => {
      const view = await mapview(
        (view) => new ol.geom.Point(view.Map.getView().getCenter()),
      );

      view.interaction.deleteCondition({
        type: 'singleclick',
        coordinate: view.Map.getView().getCenter(),
      });

      expect(view.popup()).toBeFalsy();
    });

    it.each([
      [
        'a line with two vertices',
        (view) => new ol.geom.LineString(coordinates(view, LINE.slice(0, 2))),
        [],
      ],
      [
        // https://github.com/GEOLYTIX/xyz/issues/3086: the closing coordinate of the ring was counted as a vertex, so the menu had an entry to remove a vertex of a triangle, which Openlayers does not remove.
        'a polygon with three vertices',
        (view) => new ol.geom.Polygon([coordinates(view, [...LINE, LINE[0]])]),
        [],
      ],
      [
        'a polygon with four vertices',
        (view) => new ol.geom.Polygon([ring(view, [100, 100])]),
        ['delete_vertex'],
      ],
      [
        'a multi polygon part with three vertices',
        (view) =>
          new ol.geom.MultiPolygon([[coordinates(view, [...LINE, LINE[0]])]]),
        ['delete_polygon_part'],
      ],
      [
        'a multi polygon part with four vertices',
        (view) => new ol.geom.MultiPolygon([[ring(view, [100, 100])]]),
        ['delete_vertex', 'delete_polygon_part'],
      ],
    ])('shows the menu for %s', async (_, geometry, entries) => {
      const view = await mapview(geometry);

      view.interaction.deleteCondition({
        type: 'singleclick',
        coordinate: view.Map.getCoordinateFromPixel([100, 100]),
      });

      expect(menuText(view)).toEqual(
        entries.map((entry) => mapp.dictionary[entry]),
      );
    });

    it('deletes the part of a multi polygon closest to the click', async () => {
      const view = await mapview(
        (view) =>
          new ol.geom.MultiPolygon([
            [ring(view, [100, 100])],
            [ring(view, [400, 300])],
          ]),
      );

      const geometry = view.interaction.Feature.getGeometry();

      view.interaction.deleteCondition({
        type: 'singleclick',
        coordinate: view.Map.getCoordinateFromPixel([410, 310]),
      });

      menuItems(view)
        .find(
          (li) => li.textContent.trim() === mapp.dictionary.delete_polygon_part,
        )
        .click();

      // The first part is kept.
      expect(geometry.getCoordinates()).toEqual([[ring(view, [100, 100])]]);
      expect(view.interaction.source.getFeatures()).toEqual([
        view.interaction.Feature,
      ]);
      expect(view.interaction.modifyend).toHaveBeenCalledTimes(1);
    });

    it('finishes the interaction with null if the last part is deleted', async () => {
      const callback = vi.fn();

      const view = await mapview(
        (view) => new ol.geom.MultiPolygon([[ring(view, [100, 100])]]),
        { callback, modifyend: vi.fn() },
      );

      const { interaction } = view.interaction;

      view.interaction.deleteCondition({
        type: 'singleclick',
        coordinate: view.Map.getCoordinateFromPixel([100, 100]),
      });

      menuItems(view)
        .find(
          (li) => li.textContent.trim() === mapp.dictionary.delete_polygon_part,
        )
        .click();

      expect(mapInteractions(view)).not.toContain(interaction);
      expect(callback).toHaveBeenLastCalledWith(null);
      expect(view.popup()).toBeFalsy();
    });
  });

  it('modifies the geometry by dragging a vertex with real input', async () => {
    const view = await mapview();

    const target = view.Map.getTargetElement();

    await userEvent.dragAndDrop(target, target, {
      sourcePosition: pixelPosition(LINE[1]),
      targetPosition: pixelPosition([350, 50]),
    });

    expect(view.interaction.modifyend).toHaveBeenCalledTimes(1);

    const [x, y] = view.Map.getPixelFromCoordinate(
      view.interaction.Feature.getGeometry().getCoordinates()[1],
    );

    expect(x).toBeCloseTo(350, 0);
    expect(y).toBeCloseTo(50, 0);
  });
});
