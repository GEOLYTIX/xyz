export function getTemplateTest() {
    codi.describe('Workspace: Get Template Test', async () => {
        codi.it('Layer template test', async () => {
            await mapp.utils.xhr(`/test/api/workspace/test`);

            const res = await mapp.utils.xhr('/test/api/query?layer=template_test&template=layer_data_array')

            codi.assertEqual(res, [1, 2, 5, 3, 4], 'We expect the query to be able to return from the workspace before the layer has been merged')
        })
    });
}