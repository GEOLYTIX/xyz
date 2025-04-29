/**
 * This is the vector module used to test /lib/layer/format/vector
 * @module layer/format/vector
 */

import ukFeatures from '../../../assets/data/uk.json';
import geojsonLayerDefault from '../../../assets/layers/geojson/layer.json';

/**
 * This is the entry point function for the vector test module.
 * @function vectorTest
 * @param {object} mapview
 */
export function vector(mapview) {
  codi.describe(
    { name: 'Vector:', id: 'layer_format_vector', parentId: 'layer_format' },
    () => {
      codi.it(
        {
          name: 'Should create a geojson layer',
          parentId: 'layer_format_vector',
        },
        async () => {
          const custom_config = {
            key: 'geojson_test',
            featureLocation: true,
          };

          const layer_params = {
            ...geojsonLayerDefault,
            ...custom_config,
          };

          layer_params.features = ukFeatures.features;

          layer_params.params = {
            fields: ['id', 'name', 'description', 'geom_4326'],
          };

          const [layer] = await mapview.addLayer(layer_params);

          const layersTab = document.getElementById('layers');

          const layers = {
            [custom_config.key]: mapview.layers[custom_config.key],
          };

          // Create layers listview.
          mapp.ui.layers.listview({
            target: layersTab,
            layers: layers,
          });

          codi.assertTrue(
            Object.hasOwn(layer, 'show'),
            'The layer should have a show function',
          );
          codi.assertTrue(
            Object.hasOwn(layer, 'display'),
            'The layer should have a display property',
          );
          codi.assertTrue(
            Object.hasOwn(layer, 'hide'),
            'The layer should have a hide function',
          );
          codi.assertTrue(
            Object.hasOwn(layer, 'reload'),
            'The layer should have a reload function',
          );
          codi.assertTrue(
            Object.hasOwn(layer, 'tableCurrent'),
            'The layer should have a tableCurrent function',
          );

          await mapview.removeLayer(layer.key);
        },
      );

      /**
       * ### Should be able to custom vector layer
       * 1. It takes layer params.
       * 2. Decorates the layer.
       * @function it
       */
      codi.it(
        {
          name: 'Should create a wkt layer with a custom featureFormat',
          parentId: 'layer_format_vector',
        },
        async () => {
          const custom_config = {
            key: 'feature_format_test',
            featureFormat: 'customFeatureFormat',
            featureLocation: true,
          };

          const layer_params = {
            // mapview: mapview,
            ...geojsonLayerDefault,
            ...custom_config,
          };

          mapp.layer.featureFormats.customFeatureFormat = customFeatureFormat;

          layer_params.features = ukFeatures.features;

          layer_params.params = {
            fields: ['id', 'pin', 'name', 'description', 'geom_4326'],
          };

          const [layer] = await mapview.addLayer(layer_params);

          const layersTab = document.getElementById('layers');

          const layers = {
            [custom_config.key]: mapview.layers[custom_config.key],
          };

          // Create layers listview.
          mapp.ui.layers.listview({
            target: layersTab,
            layers: layers,
          });

          codi.assertTrue(
            Object.hasOwn(layer, 'show'),
            'The layer should have a show function',
          );
          codi.assertTrue(
            Object.hasOwn(layer, 'display'),
            'The layer should have a display property',
          );
          codi.assertTrue(
            Object.hasOwn(layer, 'hide'),
            'The layer should have a hide function',
          );
          codi.assertTrue(
            Object.hasOwn(layer, 'reload'),
            'The layer should have a reload function',
          );
          codi.assertTrue(
            Object.hasOwn(layer, 'tableCurrent'),
            'The layer should have a tableCurrent function',
          );

          await mapview.removeLayer(layer.key);
        },
      );
    },
  );
}

function customFeatureFormat(layer, features) {
  const formatGeojson = new ol.format.GeoJSON();

  mapp.layer.featureFields.reset(layer);

  return features.map((feature) => {
    // Create the OpenLayers geometry
    const olGeometry = formatGeojson.readGeometry(feature.geometry, {
      dataProjection: 'EPSG:' + layer.srid,
      featureProjection: 'EPSG:' + layer.mapview.srid,
    });

    return new ol.Feature({
      id: feature.id,
      geometry: olGeometry,
      ...feature.properties,
    });
  });
}
