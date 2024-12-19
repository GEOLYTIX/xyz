/**
 * @module mod/workspace/templates/wkt.test.mjs
 */

/**
 * @description Entry point for the wkt template module
 * @function wktTemplate
 * @deprecated
 */
export function wktTemplate() {
    codi.describe({ name: 'wkt Template', id: 'api_template_wkt', parentId: 'api_workspace_template' }, () => {
        /**
         * @description Cluster Test
         * @function it
         */
        codi.it({ name: 'wkt Test', parentId: 'api_template_wkt' }, async () => {

            const params = {
                template: 'wkt',
                locale: 'locale',
                layer: 'wkt_layer',
                table: 'test.scratch',
                geom: 'geom_3857',
                srid: '3857'
            }

            const results = await mapp.utils.xhr(`/test/api/query?${mapp.utils.paramString(params)}`);
            codi.assertTrue(Array.isArray(results), 'We should get an array returned');
        });
    });
}