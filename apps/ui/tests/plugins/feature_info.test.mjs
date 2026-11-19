import { describe, expect, it, vi } from 'vitest';
import plugins from '../../lib/plugins/_plugins.mjs';
import { feature_info } from '../../lib/plugins/feature_info.mjs';
import { createMapview, getLocale } from '../helpers.mjs';

/**
Creates a scratch mapview with a mapButton element and the feature_info plugin. The highlight interaction is spied on and the mapview popup is mocked.
*/
async function setup(plugin = {}) {
  const mapview = await createMapview(await getLocale('scratch'));

  mapview.mapButton = document.createElement('div');

  feature_info(plugin, mapview);

  return {
    btn: mapview.mapButton.querySelector('[data-id=feature_info]'),
    highlight: vi.spyOn(mapview.interactions, 'highlight'),
    mapview,
    plugin,
    popup: vi.spyOn(mapview, 'popup').mockImplementation(() => {}),
  };
}

/**
Returns a highlight feature with an Openlayers feature for the getFeature method of the highlight interaction.
*/
function highlightFeature(properties, layer = { key: 'scratch_location' }) {
  return {
    id: 1,
    layer,
    F: new ol.Feature({
      geometry: new ol.geom.Point([0, 0]),
      Styles: [new ol.style.Style()],
      ...properties,
    }),
  };
}

/**
Returns the JSON of the pre element passed as popup content.
*/
function popupJSON(popup) {
  return JSON.parse(popup.mock.calls.at(-1)[0].content.textContent);
}

describe('plugins/feature_info', () => {
  it('is in the plugins collection', () => {
    expect(plugins.feature_info).toBe(feature_info);
  });

  it('does nothing without a mapButton', () => {
    expect(() => feature_info({}, {})).not.toThrow();
  });

  it('accepts true as plugin config', async () => {
    const mapview = await createMapview(await getLocale('scratch'));

    mapview.mapButton = document.createElement('div');

    feature_info(true, mapview);

    expect(
      mapview.mapButton.querySelector('[data-id=feature_info]').title,
    ).toBe(mapp.dictionary.feature_info);
  });

  it('toggles the feature_info highlight interaction', async () => {
    const { btn, highlight, mapview } = await setup();

    const icon = btn.querySelector('span');

    btn.click();

    expect(icon.classList.contains('active')).toBe(true);
    expect(highlight).toHaveBeenCalledTimes(1);
    expect(mapview.interaction.getFeature).toBe(
      highlight.mock.calls[0][0].getFeature,
    );

    btn.click();

    // The default highlight interaction finishes the feature_info interaction, which removes the active class in its callback.
    expect(icon.classList.contains('active')).toBe(false);
    expect(highlight).toHaveBeenCalledTimes(2);
    expect(highlight.mock.calls[1]).toEqual([]);
  });

  it('shows the feature properties in a popup', async () => {
    const { btn, mapview, plugin, popup } = await setup();

    btn.click();

    mapview.interaction.getFeature(highlightFeature({ name: 'foo' }));

    expect(popupJSON(popup)).toEqual({
      id: 1,
      layer: 'scratch_location',
      properties: { name: 'foo' },
    });

    const content = popup.mock.calls[0][0].content;

    expect(content.tagName).toBe('PRE');
    expect(content.getAttribute('style')).toBe(plugin.css);
  });

  it('uses the plugin css for the popup content', async () => {
    const { btn, mapview, popup } = await setup({ css: 'color: red;' });

    btn.click();

    mapview.interaction.getFeature(highlightFeature({ name: 'foo' }));

    expect(popup.mock.calls[0][0].content.style.color).toBe('red');
  });

  it('shows the number of cluster features', async () => {
    const { btn, mapview, popup } = await setup();

    btn.click();

    mapview.interaction.getFeature(
      highlightFeature({
        features: [
          new ol.Feature({ name: 'a' }),
          new ol.Feature({ name: 'b' }),
        ],
      }),
    );

    expect(popupJSON(popup).properties.features).toBe(2);
  });

  it('shows the cluster label of the cluster features', async () => {
    const { btn, mapview, popup } = await setup({ features: true });

    btn.click();

    mapview.interaction.getFeature(
      highlightFeature(
        {
          features: [
            new ol.Feature({ name: 'a' }),
            new ol.Feature({ name: 'b' }),
          ],
        },
        { key: 'retail_points', cluster: { label: 'name' } },
      ),
    );

    expect(popupJSON(popup).properties.features).toEqual(['a', 'b']);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3114: the features flag reads the label from feature.layer.cluster, which throws for a layer without a cluster config, eg. a feature with a features array property.
  it.fails(
    'shows the features of a layer without a cluster config',
    async () => {
      const { btn, mapview, popup } = await setup({ features: true });

      btn.click();

      expect(() =>
        mapview.interaction.getFeature(
          highlightFeature({
            features: [new ol.Feature({ name: 'a' })],
          }),
        ),
      ).not.toThrow();

      expect(popup).toHaveBeenCalled();
    },
  );
});
