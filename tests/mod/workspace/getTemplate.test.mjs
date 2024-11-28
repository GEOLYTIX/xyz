/**
 * ## queryTest()
 * @module mod/workspace
 */

/**
 * This function is used to test getTemplate module
 * @function getTemplateTest 
*/
export function getTemplateTest() {
    codi.describe('Workspace: Get Template Test', async () => {

         /**
         * function @it
         * Check for layer templates present in worksapce templates
         */
        codi.it('Layer template test', async () => {
            const res = await mapp.utils.xhr('/test/api/query?layer=template_test&template=layer_data_array')
            codi.assertEqual(res, [1, 2, 5, 3, 4], 'We expect the query to be able to return from the workspace before the layer has been merged')
        })

        /**
         * function @it
         * Check that templates inside object are merged correctly into the workspace
         */
        codi.it('Layer style.themes template test', async () => {
            const firstStyle = await mapp.utils.xhr('/test/api/query?layer=template_test&template=style_template')
            const secondStyle = await mapp.utils.xhr('/test/api/query?layer=template_test&template=style_template_2')

            codi.assertFalse(firstStyle instanceof Error, 'We expect to see merged templates from themes')
            codi.assertFalse(secondStyle instanceof Error, 'We expect to see merged templates from themes')
        })
    });
}