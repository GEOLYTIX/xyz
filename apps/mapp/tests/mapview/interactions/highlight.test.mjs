import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import {
  addLayers,
  createMapview,
  getLocale,
  pixelPosition,
  pointerClick,
  pointerEvent,
} from '../../helpers.mjs';

/**
Creates the grocery mapview with the highlight interaction. The retail_points cluster layer has a qID and infoj entries.

The getFeature method is a mock, so that a click does not request a location.
*/
async function mapview(params = {}) {
  const locale = await getLocale('grocery');

  const view = await createMapview(locale, locale.view);

  await addLayers(view);

  view.interactions.highlight({ getFeature: vi.fn(), ...params });

  return view;
}

/**
Returns the cluster features of the retail_points layer with their map pixels, sorted by the number of stores in the cluster.
*/
function clusters(view) {
  return view.layers.retail_points.cluster.source
    .getFeatures()
    .sort((a, b) => b.get('features').length - a.get('features').length)
    .map((feature) => ({
      feature,
      pixel: view.Map.getPixelFromCoordinate(
        feature.getGeometry().getCoordinates(),
      ),
    }));
}

/**
Returns a map pixel without a feature in the hit tolerance of the highlight interaction.
*/
function emptyPixel(view) {
  for (let x = 20; x < 780; x += 20) {
    for (let y = 20; y < 580; y += 20) {
      const features = view.Map.getFeaturesAtPixel([x, y], {
        hitTolerance: 20,
      });

      if (!features.length) return [x, y];
    }
  }
}

function target(view) {
  return view.Map.getTargetElement();
}

describe('mapview interactions highlight', () => {
  it('assigns the highlight interaction with defaults', async () => {
    const locale = await getLocale('smoke');

    const view = await createMapview(locale, { lat: 51.5, lng: -0.1, z: 10 });

    const finish = vi.fn();

    view.interaction = { finish };

    view.interactions.highlight({ hitTolerance: 10, custom: true });

    // The current interaction is finished.
    expect(finish).toHaveBeenCalledTimes(1);

    expect(view.interaction.type).toBe('highlight');
    expect(view.interaction.longClickMS).toBe(500);
    expect(view.interaction.longClickMethod).toBe(view.allFeatures);
    expect(view.interaction.candidateKeys).toBeInstanceOf(Set);

    // The params are spread into the defaults.
    expect(view.interaction.hitTolerance).toBe(10);
    expect(view.interaction.custom).toBe(true);
  });

  it('filters the layers with a qID', async () => {
    const view = await mapview();

    expect(view.interaction.layerFilter(view.layers.retail_points.L)).toBe(
      true,
    );

    // The osm tiles layer has no qID.
    expect(view.interaction.layerFilter(view.layers.osm.L)).toBe(false);

    expect(view.interaction.layerFilter(new ol.layer.Vector())).toBe(false);
  });

  describe('pointermove', () => {
    it('highlights the feature at the pixel', async () => {
      const view = await mapview();

      const [{ feature, pixel }] = clusters(view);

      const layer = view.layers.retail_points;

      const changed = vi.spyOn(layer.L, 'changed');

      pointerEvent(view, 'pointermove', pixel);

      const id = feature.get('id');

      expect(view.interaction.current).toEqual({
        key: `retail_points!${id}`,
        F: feature,
        L: layer.L,
        layer,
        id,
      });

      // The layer.highlight is the feature id for the featureStyle method.
      expect(layer.highlight).toBe(id);
      expect([...view.interaction.candidateKeys]).toEqual([
        `retail_points!${id}`,
      ]);

      // The layer has infoj entries, so the feature can be selected.
      expect(target(view).style.cursor).toBe('pointer');

      // The layer is rendered with the highlight style.
      expect(changed).toHaveBeenCalledTimes(1);
    });

    it('calls the hover method of the layer style', async () => {
      const view = await mapview();

      const [{ feature, pixel }] = clusters(view);

      const layer = view.layers.retail_points;

      const method = vi.fn();

      layer.style.hover = { method };

      pointerEvent(view, 'pointermove', pixel);

      expect(method).toHaveBeenCalledWith(feature, layer);

      // The same candidates are not highlighted again.
      pointerEvent(view, 'pointermove', pixel);

      expect(method).toHaveBeenCalledTimes(1);
    });

    it('highlights another feature', async () => {
      const view = await mapview();

      const [first, second] = clusters(view);

      pointerEvent(view, 'pointermove', first.pixel);
      pointerEvent(view, 'pointermove', second.pixel);

      expect(view.interaction.current.F).toBe(second.feature);
      expect(view.layers.retail_points.highlight).toBe(
        second.feature.get('id'),
      );
    });

    it('clears the highlight without a feature at the pixel', async () => {
      const view = await mapview();

      const [{ pixel }] = clusters(view);

      const layer = view.layers.retail_points;

      pointerEvent(view, 'pointermove', pixel);

      const infotip = vi.spyOn(view, 'infotip');
      const changed = vi.spyOn(layer.L, 'changed');

      pointerEvent(view, 'pointermove', emptyPixel(view));

      expect(view.interaction.current).toBeUndefined();
      expect(layer.highlight).toBeUndefined();
      expect(view.interaction.candidateKeys.size).toBe(0);
      expect(target(view).style.cursor).toBe('auto');
      expect(infotip).toHaveBeenCalledWith(null);
      expect(changed).toHaveBeenCalledTimes(1);
    });

    it('does not highlight features of layers which are filtered out', async () => {
      const view = await mapview({ layerFilter: () => false });

      const [{ pixel }] = clusters(view);

      pointerEvent(view, 'pointermove', pixel);

      expect(view.interaction.current).toBeUndefined();
    });

    it('does not highlight a feature for a touch pointer', async () => {
      const view = await mapview();

      const [{ pixel }] = clusters(view);

      const layer = view.layers.retail_points;

      const method = vi.fn();

      layer.style.hover = { method };

      pointerEvent(view, 'pointermove', pixel, { pointerType: 'touch' });

      // There is no cursor to highlight a feature for.
      expect(view.interaction.current).toBeUndefined();
      expect(layer.highlight).toBeUndefined();
      expect(method).not.toHaveBeenCalled();
      expect(view.interaction.getFeature).not.toHaveBeenCalled();
    });
  });

  describe('click', () => {
    it('gets the highlighted feature', async () => {
      const view = await mapview();

      const [{ feature, pixel }] = clusters(view);

      view.popup({ content: document.createElement('div') });

      pointerClick(view, pixel);

      expect(view.interaction.getFeature).toHaveBeenCalledTimes(1);
      expect(view.interaction.getFeature).toHaveBeenCalledWith(
        expect.objectContaining({ F: feature, id: feature.get('id') }),
      );

      // A click removes the popup.
      expect(view.popup()).toBeFalsy();
    });

    it('does not get a feature for another click within 600ms', async () => {
      const view = await mapview();

      const [{ pixel }] = clusters(view);

      pointerClick(view, pixel);
      pointerClick(view, pixel);

      expect(view.interaction.getFeature).toHaveBeenCalledTimes(1);
    });

    it('does not get a feature without a highlight', async () => {
      const view = await mapview();

      pointerClick(view, emptyPixel(view));

      expect(view.interaction.getFeature).not.toHaveBeenCalled();
    });

    it('calls the Click method instead of the getFeature method', async () => {
      const Click = vi.fn();

      const view = await mapview({ Click });

      const [{ pixel }] = clusters(view);

      pointerClick(view, pixel);

      expect(Click).toHaveBeenCalledTimes(1);
      expect(Click.mock.calls[0][0].type).toBe('click');
      expect(view.interaction.getFeature).not.toHaveBeenCalled();
    });

    it('calls the noLocationClick method without a highlight', async () => {
      const noLocationClick = vi.fn();

      const view = await mapview({ noLocationClick });

      const [{ pixel }] = clusters(view);

      pointerClick(view, emptyPixel(view));

      expect(noLocationClick).toHaveBeenCalledTimes(1);

      // The click is limited to 600ms.
      clearTimeout(view.interaction.clicked);
      view.interaction.clicked = null;

      pointerClick(view, pixel);

      // The highlighted feature is selected.
      expect(noLocationClick).toHaveBeenCalledTimes(1);
      expect(view.interaction.getFeature).toHaveBeenCalledTimes(1);
    });

    it('gets the feature at a touch click without a highlight', async () => {
      const view = await mapview();

      const [{ feature, pixel }] = clusters(view);

      const layer = view.layers.retail_points;

      // A touch has no pointermove before the click.
      pointerEvent(view, 'click', pixel, { pointerType: 'touch' });

      expect(view.interaction.getFeature).toHaveBeenCalledWith(
        expect.objectContaining({ F: feature, layer }),
      );

      // The feature is not highlighted.
      expect(view.interaction.current).toBeUndefined();
      expect(layer.highlight).toBeUndefined();
    });
  });

  describe('long click', () => {
    it('calls the longClickMethod after the longClickMS', async () => {
      const longClickMethod = vi.fn();

      const view = await mapview({ longClickMethod, longClickMS: 1 });

      const [{ pixel }] = clusters(view);

      target(view).dispatchEvent(new MouseEvent('mousedown'));

      await vi.waitFor(() => expect(view.interaction.longClick).toBe(true));

      expect(target(view).style.cursor).toBe('wait');

      const event = pointerEvent(view, 'click', pixel);

      expect(longClickMethod).toHaveBeenCalledWith(event, view);
      expect(view.interaction.getFeature).not.toHaveBeenCalled();
      expect(target(view).style.cursor).toBe('auto');
    });

    it('is cancelled by a click before the longClickMS', async () => {
      const longClickMethod = vi.fn();

      const view = await mapview({ longClickMethod });

      const [{ pixel }] = clusters(view);

      target(view).dispatchEvent(new MouseEvent('mousedown'));

      pointerClick(view, pixel);

      expect(longClickMethod).not.toHaveBeenCalled();
      expect(view.interaction.getFeature).toHaveBeenCalledTimes(1);
    });

    it('is cancelled by a pointermove', async () => {
      const longClickMethod = vi.fn();

      const view = await mapview({ longClickMethod, longClickMS: 1 });

      target(view).dispatchEvent(new MouseEvent('mousedown'));

      await vi.waitFor(() => expect(view.interaction.longClick).toBe(true));

      // The map is panned.
      pointerEvent(view, 'pointermove', emptyPixel(view));

      expect(view.interaction.longClick).toBeUndefined();
      expect(target(view).style.cursor).toBe('grab');
    });

    it('is not enabled without a longClickMethod', async () => {
      const view = await mapview({ longClickMethod: null });

      target(view).dispatchEvent(new MouseEvent('mousedown'));

      expect(view.interaction.longClickTimeout).toBeUndefined();
    });
  });

  it('resets the cursor on mouseup', async () => {
    const view = await mapview();

    target(view).style.cursor = 'wait';

    target(view).dispatchEvent(new MouseEvent('mouseup'));

    expect(target(view).style.cursor).toBe('auto');
  });

  it('clears the highlight on mouseleave', async () => {
    const view = await mapview();

    const [{ pixel }] = clusters(view);

    pointerEvent(view, 'pointermove', pixel);

    target(view).dispatchEvent(new MouseEvent('mouseleave'));

    expect(view.interaction.current).toBeUndefined();
    expect(view.interaction.candidateKeys.size).toBe(0);
    expect(view.layers.retail_points.highlight).toBeUndefined();
  });

  it('prevents the default of a touchstart', async () => {
    const view = await mapview();

    const event = new Event('touchstart', { cancelable: true });

    target(view).dispatchEvent(event);

    // The mousedown event for the long click is not dispatched for a touch.
    expect(event.defaultPrevented).toBe(true);
  });

  it('removes the highlight and the listeners on finish', async () => {
    const callback = vi.fn();

    const view = await mapview({ callback });

    const [{ pixel }] = clusters(view);

    pointerEvent(view, 'pointermove', pixel);

    view.popup({ content: document.createElement('div') });

    view.interaction.finish();

    expect(view.interaction.current).toBeUndefined();
    expect(view.layers.retail_points.highlight).toBeUndefined();
    expect(view.popup()).toBeFalsy();
    expect(callback).toHaveBeenCalledTimes(1);

    // The map events are no longer handled.
    pointerClick(view, pixel);

    expect(view.interaction.current).toBeUndefined();
    expect(view.interaction.getFeature).not.toHaveBeenCalled();

    const event = new Event('touchstart', { cancelable: true });

    target(view).dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  describe('getFeature', () => {
    /**
    Creates the smoke mapview with the default getFeature method of the highlight interaction.
    */
    async function smoke() {
      const locale = await getLocale('smoke');

      const view = await createMapview(locale, { lat: 51.5, lng: -0.1, z: 10 });

      view.interactions.highlight();

      return view;
    }

    it('gets the location of a feature', async () => {
      const view = await smoke();

      const get = vi.spyOn(mapp.location, 'get').mockImplementation(() => {});

      const layer = { table: 'example.locations' };

      view.interaction.getFeature({
        F: new ol.Feature({ id: 2 }),
        id: 2,
        layer,
      });

      expect(get).toHaveBeenCalledWith({
        id: 2,
        layer,
        table: 'example.locations',
      });
    });

    it('gets the location from the current table of the layer', async () => {
      const view = await smoke();

      const get = vi.spyOn(mapp.location, 'get').mockImplementation(() => {});

      const layer = { tableCurrent: () => 'example.current' };

      view.interaction.getFeature({ F: new ol.Feature(), id: 2, layer });

      expect(get).toHaveBeenCalledWith({
        id: 2,
        layer,
        table: 'example.current',
      });
    });

    it('lists the features of a cluster in a popup', async () => {
      const view = await smoke();

      const get = vi.spyOn(mapp.location, 'get').mockImplementation(() => {});

      const layer = { cluster: { label: 'name' }, table: 'example.locations' };

      const coordinates = view.Map.getView().getCenter();

      const F = new ol.Feature({
        count: 2,
        features: [
          new ol.Feature({ id: 2, name: 'Paris' }),
          new ol.Feature({ id: 3 }),
        ],
        geometry: new ol.geom.Point(coordinates),
      });

      view.interaction.getFeature({ F, layer });

      const items = [...view.popup().querySelectorAll('ul.list > li')];

      // The id is the label of a feature without a label property.
      expect(items.map((li) => li.textContent)).toEqual(['Paris', '3']);

      expect(view.Map.getOverlays().getArray().at(-1).getPosition()).toEqual(
        coordinates,
      );

      expect(get).not.toHaveBeenCalled();

      items[1].dispatchEvent(new PointerEvent('pointerup'));

      expect(get).toHaveBeenCalledWith({
        id: 3,
        layer,
        table: 'example.locations',
      });

      expect(view.popup()).toBeFalsy();
    });

    it('gets the nearest location of a cluster which is not clustered in the source', async () => {
      const view = await smoke();

      const nnearest = vi
        .spyOn(mapp.location, 'nnearest')
        .mockImplementation(() => {});

      const get = vi.spyOn(mapp.location, 'get').mockImplementation(() => {});

      const layer = { table: 'example.locations' };

      const F = new ol.Feature({ count: 5 });

      view.interaction.getFeature({ F, layer });

      expect(nnearest).toHaveBeenCalledWith({
        feature: F,
        layer,
        mapview: view,
        table: 'example.locations',
      });

      expect(get).not.toHaveBeenCalled();
    });
  });

  it('highlights and gets a feature with real input', async () => {
    const view = await mapview();

    const [{ feature, pixel }] = clusters(view);

    const layer = view.layers.retail_points;

    const position = pixelPosition(pixel);

    await userEvent.hover(target(view), { position });

    expect(view.interaction.current.F).toBe(feature);
    expect(target(view).style.cursor).toBe('pointer');

    await userEvent.click(target(view), { position });

    // The cluster features may be created again by a render between the hover and the click.
    expect(view.interaction.getFeature).toHaveBeenCalledTimes(1);
    expect(view.interaction.getFeature.mock.calls[0][0].layer).toBe(layer);
  });
});
