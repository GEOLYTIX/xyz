import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { addLayers, createMapview, getLocale } from '../../helpers.mjs';

/**
Creates the smoke mapview with the locations and features vector layers.
*/
async function smoke() {
  const locale = await getLocale('smoke');

  const view = await createMapview(locale, { lat: 51.5, lng: -0.1, z: 10 });

  await addLayers(view);

  return view;
}

/**
Creates the countries mapview with the countries mvt layer. The layer has a featureSource for the feature geometries.
*/
async function countries() {
  const locale = await getLocale('countries');

  const view = await createMapview(locale, locale.view);

  await addLayers(view);

  return view;
}

/**
Starts a draw interaction which is finished before the map is disposed, because the interaction has a keyup listener on the document.
*/
function draw(view, params) {
  view.interactions.draw({ type: 'Point', ...params });

  const { interaction } = view.interaction;

  onTestFinished(() => {
    if (view.Map.getInteractions().getArray().includes(interaction)) {
      view.interaction.finish();
    }
  });
}

function snapInteractions(view) {
  return view.Map.getInteractions()
    .getArray()
    .filter((interaction) => interaction instanceof ol.interaction.Snap);
}

function mapLayers(view) {
  return view.Map.getLayers().getArray();
}

/**
Dispatches a tileloadend event for a tile with the features on a featureSource.
*/
function tileloadend(featureSource, features) {
  featureSource.dispatchEvent({
    type: 'tileloadend',
    tile: { getFeatures: () => features },
  });
}

describe('mapview interactions snap', () => {
  it('does not snap without the snap property of the interaction', async () => {
    const view = await smoke();

    draw(view, { layer: view.layers.features });

    expect(view.interaction.snap).toBeUndefined();
    expect(snapInteractions(view)).toEqual([]);
  });

  it('snaps to the layer of the interaction', async () => {
    const view = await smoke();

    const layer = view.layers.features;

    const show = vi.spyOn(layer, 'show');

    draw(view, { layer, snap: true });

    const { snap } = view.interaction;

    expect(snap.layer).toBe(layer);

    // The snap layer is shown.
    expect(show).toHaveBeenCalledTimes(1);

    // The source of a vector layer is the snap source.
    expect(snap.source).toBe(layer.L.getSource());
    expect(snap.interaction).toBeInstanceOf(ol.interaction.Snap);
    expect(snapInteractions(view)).toEqual([snap.interaction]);
  });

  it.each([
    ['a layer key', 'locations'],
    ['a snap object with a layer key', { layer: 'locations' }],
  ])('snaps to the layer of %s', async (_, snap) => {
    const view = await smoke();

    draw(view, { layer: view.layers.features, snap });

    expect(view.interaction.snap.layer).toBe(view.layers.locations);
    expect(view.interaction.snap.source).toBe(
      view.layers.locations.L.getSource(),
    );
    expect(snapInteractions(view)).toHaveLength(1);
  });

  it('warns for a snap layer which is not in the mapview', async () => {
    const view = await smoke();

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    draw(view, { layer: view.layers.features, snap: 'unknown' });

    expect(warn).toHaveBeenCalledWith(
      'Unable to snap to layer:unknown as it is not found in mapview.layers.',
    );
    expect(snapInteractions(view)).toEqual([]);

    // The interaction is finished without a snap interaction.
    expect(() => view.interaction.finish()).not.toThrow();
  });

  it('removes the snap interaction when the interaction is finished', async () => {
    const view = await smoke();

    draw(view, { layer: view.layers.features, snap: true });

    view.interaction.finish();

    expect(snapInteractions(view)).toEqual([]);
  });

  describe('mvt layer', () => {
    it('snaps to the features of the loaded tiles', async () => {
      const view = await countries();

      const layer = view.layers.countries;

      draw(view, { layer, snap: true });

      const { snap } = view.interaction;

      // The features of the tiles are added to a vector source.
      expect(snap.source).toBeInstanceOf(ol.source.Vector);
      expect(snap.source).not.toBe(layer.featureSource);
      expect(snapInteractions(view)).toEqual([snap.interaction]);

      // A transparent tile layer loads the tiles of the featureSource.
      expect(mapLayers(view)).toContain(snap.vectorTileLayer);
      expect(snap.vectorTileLayer.getSource()).toBe(layer.featureSource);
      expect(snap.vectorTileLayer.getOpacity()).toBe(0);

      const feature = new ol.Feature(new ol.geom.Point([0, 0]));

      tileloadend(layer.featureSource, [feature]);

      expect(snap.source.getFeatures()).toContain(feature);

      // Adding the same feature again does not throw.
      expect(() => tileloadend(layer.featureSource, [feature])).not.toThrow();
    });

    it('removes the tile layer and clears the featureSource', async () => {
      const view = await countries();

      const layer = view.layers.countries;

      draw(view, { layer, snap: true });

      const { snap } = view.interaction;

      const clear = vi.spyOn(layer.featureSource, 'clear');

      view.interaction.finish();

      expect(snapInteractions(view)).toEqual([]);
      expect(mapLayers(view)).not.toContain(snap.vectorTileLayer);
      expect(clear).toHaveBeenCalledTimes(1);

      // The tileloadend listener is removed.
      const feature = new ol.Feature(new ol.geom.Point([0, 0]));

      tileloadend(layer.featureSource, [feature]);

      expect(snap.source.getFeatures()).not.toContain(feature);
    });

    // https://github.com/GEOLYTIX/xyz/issues/3086: the remove method read the featureSource from the layer of the interaction and not from the snap layer. The remove method threw without an interaction layer, and the tile layer of the snap layer was not removed with another interaction layer.
    it('removes the tile layer of a snap layer which is not the interaction layer', async () => {
      const view = await countries();

      const layer = view.layers.countries;

      draw(view, { snap: 'countries' });

      const { snap } = view.interaction;

      expect(mapLayers(view)).toContain(snap.vectorTileLayer);

      const clear = vi.spyOn(layer.featureSource, 'clear');

      view.interaction.finish();

      expect(snapInteractions(view)).toEqual([]);
      expect(mapLayers(view)).not.toContain(snap.vectorTileLayer);
      expect(clear).toHaveBeenCalledTimes(1);
    });
  });
});
