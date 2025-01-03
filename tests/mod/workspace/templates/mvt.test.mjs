/**
 * @module mod/workspace/templates/mvt.test.mjs
 */

/**
 * @description Entry point for the mvt template module
 * @function mvtTemplate
 * @deprecated
 */
export function mvtTemplate() {
    codi.describe({ name: 'mvt Template', id: 'api_template_mvt', parentId: 'api_workspace_template' }, () => {
        /**
         * @description mvt Template Test
         * @function it
         */
        codi.it({ name: 'mvt Template Test', parentId: 'api_template_mvt' }, async () => {

            const params = {
                template: 'mvt',
                z: '8',
                x: '127',
                y: '86',
                locale: 'locale',
                layer: 'mvt_test',
                table: 'test.mvt_test',
                geom: 'geom_3857',
                fields: 'numeric_field',
            }

            const results = await mapp.utils.xhr(`/test/api/query?${mapp.utils.paramString(params)}`);

            codi.assertFalse(results instanceof Error, 'We shouldnt get an error')

        });
    });
}