/**
 * ## queryTest()
 * @module mod/workspace
 */

/**
 * This function is used to test getTemplate module
 * @function getTemplateTest
 */
export async function getTemplateTest() {
  codi.describe(
    {
      name: 'Templates Test',
      id: 'api_workspace_templates',
      parentId: 'api_workspace',
    },
    async () => {
      /**
       * function @it
       * Check for layer templates present in worksapce templates
       */
      codi.it(
        {
          name: 'Layer template test',
          parentId: 'api_workspace_templates',
        },
        async () => {
          const res = await mapp.utils.xhr(
            '/test/api/query?layer=template_test&template=layer_data_array',
          );
          codi.assertEqual(
            res,
            [1, 2, 5, 3, 4],
            'We expect the query to be able to return from the workspace before the layer has been merged',
          );
        },
      );

      /**
       * function @it
       * Check that templates inside object are merged correctly into the workspace
       */
      codi.it(
        {
          name: 'Layer style.themes template test',
          parentId: 'api_workspace_templates',
        },
        async () => {
          // Run both requests in parallel
          const [firstStyle, secondStyle] = await Promise.all([
            mapp.utils.xhr(
              '/test/api/query?layer=template_test&template=style_template',
            ),
            mapp.utils.xhr(
              '/test/api/query?layer=template_test&template=style_template_2',
            ),
          ]);

          codi.assertFalse(
            firstStyle instanceof Error,
            'We expect to see merged templates from themes',
          );
          codi.assertFalse(
            secondStyle instanceof Error,
            'We expect to see merged templates from themes',
          );
        },
      );
    },
  );
}
