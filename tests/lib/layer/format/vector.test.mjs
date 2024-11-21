/**
 * This is the vector module used to test /lib/layer/format/vector
 * @module layer/format/vector
 */

import clusterLayerDefault from '../../../assets/layers/cluster/layer.json';
import geojsonLayerDefault from '../../../assets/layers/geojson/layer.json';
import ukFeatures from '../../../assets/data/uk.json';

/**
 * This is the entry point function for the vector test module.
 * @function vectorTest 
 * @param {object} mapview 
 */
export async function vectorTest(mapview, layer) {

    layer ??= clusterLayerDefault;

    await codi.describe('Layer Format: Vector', async () => {

        /**
       * ### Should be able to create a vector layer
       * 1. It takes layer params.
       * 2. Decorates the layer.
       * 3. We then give the vector function the layer.
       * 4. We expect the format of the layer to be 'wkt'
       * 5. We expect the featureFormat of the layer to be 'test_format'
       * @function it
       */

        codi.it('Should create a wkt layer with a custom featureFormat', async () => {
            const custom_config = {
                key: 'feature_format_test',
                featureFormat: 'customFeatureFormat'
            }

            const layer_params = {
                // mapview: mapview,
                ...geojsonLayerDefault,
                ...custom_config
            }

            mapp.layer.featureFormats.customFeatureFormat = customFeatureFormat;

            layer_params.features = ukFeatures.features;

            layer_params.params = {
                fields: ['id', 'name', 'description', 'geom_4326']
            }

            const layer = await mapview.addLayer(layer_params);

            codi.assertTrue(Object.hasOwn(layer[0], 'show'), 'The layer should have a show function');
            codi.assertTrue(Object.hasOwn(layer[0], 'display'), 'The layer should have a display property');
            codi.assertTrue(Object.hasOwn(layer[0], 'hide'), 'The layer should have a hide function');
            codi.assertTrue(Object.hasOwn(layer[0], 'reload'), 'The layer should have a reload function');
            codi.assertTrue(Object.hasOwn(layer[0], 'tableCurrent'), 'The layer should have a tableCurrent function');

        });

    });
}

function customFeatureFormat(layer, features) {
    const formatGeojson = new ol.format.GeoJSON();

    function getPointOnSurface(geometry) {
        if (geometry instanceof ol.geom.Point) {
            const coords = geometry.getCoordinates();
            return [coords[0], coords[1]];
        }

        if (geometry instanceof ol.geom.Polygon ||
            geometry instanceof ol.geom.MultiPolygon) {
            const coords = geometry.getInteriorPoint().getCoordinates();
            return [coords[0], coords[1]];
        }

        const extent = geometry.getExtent();
        const center = ol.extent.getCenter(extent);
        return [center[0], center[1]];
    }

    mapp.layer.featureFields.reset(layer);


    return features.map((feature) => {
        // Populate featureFields values array with feature property values
        layer.params.fields?.forEach(field => {
            layer.featureFields[field].values.push(feature.properties[field]);
        });

        // Create the OpenLayers geometry
        const olGeometry = formatGeojson.readGeometry(feature.geometry, {
            dataProjection: 'EPSG:' + layer.srid,
            featureProjection: 'EPSG:' + layer.mapview.srid,
        });

        // Get point on surface coordinates
        const pointOnSurface = getPointOnSurface(olGeometry);

        // Add pointOnSurface to properties if needed
        feature.properties = {
            ...feature.properties,
            pin: pointOnSurface
        };

        return new ol.Feature({
            id: feature.id,
            geometry: olGeometry,
            ...feature.properties
        });
    });
}