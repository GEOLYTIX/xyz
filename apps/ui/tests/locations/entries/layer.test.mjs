import { describe, expect, it, vi } from 'vitest';
import { LIDL, lidlLocation } from '../../helpers.mjs';
import { append } from './_helpers.mjs';

const { layer } = mapp.ui.locations.entries;

/**
@function layerEntry
@async

@description
Creates a type:layer entry for a clone of the retail_points locale layer in the Lidl location and resolves once the entry layer has been decorated.

@param {Object} [params] Properties to assign to the entry.
@returns {Promise<Object>} The entry, its panel, and the location with its layer and mapview.
*/
async function layerEntry(params) {
  const lidl = await lidlLocation();

  const entry = {
    type: 'layer',
    layer: 'retail_points',
    name: 'Stores',
    display: false,
    location: lidl.location,
    ...params,
  };

  const panel = layer(entry);

  await vi.waitFor(() => expect(entry.display_toggle).toBeDefined());

  return { entry, panel, ...lidl };
}

function mapLayers(mapview) {
  return mapview.Map.getLayers().getArray();
}

describe('ui/locations/entries/layer', () => {
  it('decorates a clone of the locale layer for the location', async () => {
    const { entry, layer, location, mapview, panel } = await layerEntry();

    expect(panel).toBe(entry.panel);
    expect(panel.classList).toContain('entry-layer');

    // The entry properties are not replaced by the locale layer.
    expect(entry.name).toBe('Stores');
    expect(entry.table).toBe(layer.table);
    expect(entry.layer).toBeUndefined();
    expect(entry.params.layer_template).toBe('retail_points');
    expect(entry.source_key).toBe('retail_points');

    expect(entry.key).toBe(`retail_points-${LIDL}`);
    expect(entry.L.get('key')).toBe(entry.key);
    expect(entry.mapview).toBe(mapview);
    expect(mapview.layers[entry.key]).toBe(entry);
    expect(location.Layers).toContain(entry);

    expect(entry.display_toggle.parentElement).toBe(panel);
    expect(entry.display_toggle.dataset.id).toBe(`${entry.key}-display`);
    expect(entry.display_toggle.textContent.trim()).toBe('Stores');
    expect(entry.display_toggle.querySelector('input').checked).toBe(false);

    // The style panel is hidden until the layer is shown.
    expect(entry.style.elements).toContain('themes');
    expect(entry.style.panel.parentElement).toBe(panel);
    expect(entry.style.panel.style.display).toBe('none');
    expect(mapLayers(mapview)).not.toContain(entry.L);
  });

  it('assigns the zIndex of the location layer', async () => {
    const lidl = await lidlLocation();

    const zIndex = lidl.layer.zIndex;

    const entry = {
      type: 'layer',
      layer: 'retail_points',
      display: false,
      location: lidl.location,
    };

    layer(entry);

    expect(entry.zIndex).toBe(zIndex);
    expect(lidl.layer.zIndex).toBe(zIndex + 1);

    await vi.waitFor(() => expect(entry.display_toggle).toBeDefined());

    // A repeat call doesn't change the zIndex.
    layer(entry);

    expect(entry.zIndex).toBe(zIndex);
    expect(lidl.layer.zIndex).toBe(zIndex + 1);
  });

  it('warns for a layer which is not in the locale', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { location } = await lidlLocation();

    const entry = { type: 'layer', layer: 'no_such_layer', location };

    expect(layer(entry).classList).toContain('entry-layer');
    expect(warn).toHaveBeenCalledWith(
      'Layer [no_such_layer] not found in mapview.locale',
    );
  });

  it('shows the layer with the display flag', async () => {
    const { entry, mapview } = await layerEntry({ display: true });

    expect(entry.display_toggle.querySelector('input').checked).toBe(true);
    expect(entry.style.panel.style.display).toBe('block');
    expect(mapLayers(mapview)).toContain(entry.L);
  });

  it('shows and hides the layer with the display toggle', async () => {
    const { entry, mapview } = await layerEntry();

    // The layer decorator assigns empty callback arrays.
    const showCallback = vi.fn();
    const hideCallback = vi.fn();

    entry.showCallbacks.push(showCallback);
    entry.hideCallbacks.push(hideCallback);

    const input = append(entry.panel).querySelector('input');

    input.click();

    expect(entry.display).toBe(true);
    expect(mapLayers(mapview)).toContain(entry.L);
    expect(showCallback).toHaveBeenCalledWith(entry);

    input.click();

    expect(entry.display).toBe(false);
    expect(entry.style.panel.style.display).toBe('none');
    expect(mapLayers(mapview)).not.toContain(entry.L);
    expect(hideCallback).toHaveBeenCalledWith(entry);
  });

  it('shows a displayed layer again on a repeat call', async () => {
    const { entry } = await layerEntry({ display: true });

    const show = vi.spyOn(entry, 'show');

    const L = entry.L;

    layer(entry);

    expect(show).toHaveBeenCalledTimes(1);
    expect(entry.L).toBe(L);

    entry.hide();

    layer(entry);

    expect(show).toHaveBeenCalledTimes(1);
  });

  it('merges the location style into the default style', async () => {
    const lidl = await lidlLocation();

    lidl.location.style = { strokeColor: '#f00' };

    const entry = {
      type: 'layer',
      layer: 'retail_points',
      display: false,
      location: lidl.location,
      style: { default: { fillColor: '#00f' } },
    };

    layer(entry);

    await vi.waitFor(() => expect(entry.display_toggle).toBeDefined());

    expect(entry.style.default.strokeColor).toBe('#f00');
  });

  it('removes the layer with the location', async () => {
    const { entry, location, mapview } = await layerEntry({ display: true });

    const remove = vi.spyOn(entry, 'remove');

    location.removeCallbacks.forEach((fn) => fn());

    expect(remove).toHaveBeenCalled();
    expect(mapview.layers[entry.key]).toBeUndefined();
    expect(mapLayers(mapview)).not.toContain(entry.L);
  });

  describe('feature data', () => {
    it('assigns the value as featureSet', async () => {
      const { entry } = await layerEntry({
        value: [LIDL],
        featureSet: true,
        display: true,
      });

      expect(entry.data).toEqual([LIDL]);
      expect(entry.disabled).toBe(false);
      expect(entry.featureSet).toEqual(new Set([LIDL]));
    });

    it('assigns a single value as featureLookup array', async () => {
      const { entry } = await layerEntry({
        value: { id: LIDL, size: 1 },
        featureLookup: true,
        display: true,
      });

      expect(entry.featureLookup).toEqual([{ id: LIDL, size: 1 }]);
    });

    it('disables the entry without data for a featureSet', async () => {
      const { entry } = await layerEntry({ value: [], featureSet: true });

      expect(entry.data).toBeNull();
      expect(entry.disabled).toBe(true);
      expect(entry.display_toggle.querySelector('input').disabled).toBe(true);

      // The display toggle is enabled with data for a repeat call.
      entry.value = [LIDL];

      layer(entry);

      expect(entry.disabled).toBe(false);
      expect(entry.display_toggle.classList).not.toContain('disabled');
    });

    it('sets the data as features of the vector layer', async () => {
      const { entry } = await layerEntry();

      const setSource = vi
        .spyOn(entry, 'setSource')
        .mockImplementation(() => {});

      const features = [{ id: 1 }];

      entry.data = features;

      await entry.show();

      expect(entry.features).toBe(features);
      expect(setSource).toHaveBeenCalledWith(features);
    });

    it('queries the data when the layer is shown', async () => {
      const { entry } = await layerEntry({
        featureSet: true,
        query: 'store_ids',
        queryparams: { id: true },
      });

      const xhr = vi.spyOn(mapp.utils, 'xhr').mockResolvedValue([LIDL]);

      await entry.show();

      const url = new URL(xhr.mock.calls[0][0]);

      expect(url.searchParams.get('template')).toBe('store_ids');
      expect(url.searchParams.get('id')).toBe(String(LIDL));
      // The layer param is the key of the location layer.
      expect(url.searchParams.get('layer')).toBe('retail_points');
      expect(entry.featureSet).toEqual(new Set([LIDL]));
      expect(entry.display).toBe(true);
    });

    it('disables the entry without a query response', async () => {
      const { entry, mapview } = await layerEntry({
        featureSet: true,
        query: 'store_ids',
      });

      vi.spyOn(mapp.utils, 'xhr').mockResolvedValue(null);

      await entry.show();

      expect(entry.disabled).toBe(true);
      expect(entry.display_toggle.classList).toContain('disabled');
      expect([...entry.panel.children]).toEqual([entry.display_toggle]);
      expect(mapLayers(mapview)).not.toContain(entry.L);
    });

    // Known bug https://github.com/GEOLYTIX/xyz/issues/3135: the showLayer method checks the query response for a falsy value. The xhr utility resolves a failed request with an Error, which is assigned as featureSet data.
    it.fails('disables the entry for a failed query', async () => {
      const { entry } = await layerEntry({
        featureSet: true,
        query: 'store_ids',
      });

      vi.spyOn(mapp.utils, 'xhr').mockResolvedValue(new Error('HTTP 400'));

      await entry.show();

      expect(entry.disabled).toBe(true);
    });
  });
});
