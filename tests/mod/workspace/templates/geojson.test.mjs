/**
 * @module mod/workspace/templates/geojson.test.mjs
 */

/**
 * @description Entry point for the geojson template module
 * @function geojsonTemplate
 * @deprecated
 */
export function geojsonTemplate() {
    codi.describe({ name: 'geojson Template', id: 'api_template_geojson', parentId: 'api_workspace_template' }, () => {
        /**
         * @description geojson Template Test
         * @function it
         */
        codi.it({ name: 'geojson Template Test', parentId: 'api_template_geojson' }, async () => {

            const params = {
                qID: 'id',
                geom: 'geom_3857',
                template: 'geojson',
                layer: 'geojson_layer',
                table: 'test.scratch',
                fields: ['textarea']
            }

            const results = await mapp.utils.xhr(`/test/api/query?${mapp.utils.paramString(params)}`);

            codi.assertTrue(Array.isArray(results), 'We should get an array returned');

            results.forEach(feature => {

                codi.assertTrue(feature.type === 'Feature', 'The types needs to be a Feature');
                codi.assertTrue(Object.hasOwn(feature, 'id'), 'The feature needs to have an id');
                codi.assertTrue(Object.hasOwn(feature, 'geometry'), 'The feature needs to have a geometry');
                codi.assertTrue(Object.hasOwn(feature.geometry, 'coordinates'), 'The feature needs to have coordinates');
                codi.assertTrue(Array.isArray(feature.geometry.coordinates), 'The coordinates need to be an array');
                codi.assertTrue(Object.hasOwn(feature.geometry, 'crs'), 'The geometry need to have crs property');
                codi.assertTrue(Object.hasOwn(feature.geometry.crs, 'properties'), 'The crs needs to have properties');
                codi.assertTrue(Object.hasOwn(feature.geometry.crs, 'type'), 'The crs needs to have type');
                codi.assertTrue(Object.hasOwn(feature.properties, 'textarea'), 'The feature should have a textarea property');

            });
        });
    });
}