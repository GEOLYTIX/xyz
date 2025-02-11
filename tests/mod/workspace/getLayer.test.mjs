export function getLayerTest() {
  codi.describe('Workspace tests: Get Layer Test', async () => {
    await codi.it('Workspace: Getting template_test Layer', async () => {
      let layer = await mapp.utils.xhr(
        `/test/api/workspace/layer?layer=template_test`,
      );
      codi.assertEqual(
        layer.key,
        'template_test',
        'Ensure that we get the template_test layer from the API',
      );
      codi.assertTrue(!!layer.table, 'Ensure that the layer has a table');
      codi.assertTrue(!!layer.geom, 'Ensure that the layer has a geom');
      codi.assertTrue(!!layer.group, 'Ensure that the layer has a group');
      codi.assertEqual(
        layer.infoj.length,
        7,
        'The infoj should always have 7 infoj entries',
      );
      codi.assertTrue(
        !!layer.style,
        'The layer needs to have a style object from another template',
      );

      layer = await mapp.utils.xhr(
        `/test/api/workspace/layer?layer=template_test`,
      );
      codi.assertEqual(
        layer.infoj.length,
        7,
        'The infoj should always have 7 infoj entries',
      );
      codi.assertTrue(
        !!layer.style,
        'The layer needs to have a style object from another template',
      );
      codi.assertTrue(!!layer.err, 'The layer should have a error array');
      codi.assertEqual(
        layer.err.length,
        1,
        'There should be on failure on the layer',
      );
    });

    await codi.it(
      'Workspace: Getting template_test_vanilla Layer',
      async () => {
        const layer = await mapp.utils.xhr(
          `/test/api/workspace/layer?layer=template_test_vanilla`,
        );
        codi.assertEqual(
          layer.key,
          'template_test_vanilla',
          'Ensure that we get the template_test_vanilla layer from the API',
        );
        codi.assertEqual(
          layer.infoj.length,
          6,
          'The infoj should always have 6 infoj entries',
        );
        codi.assertTrue(
          !!layer.style,
          'The layer needs to have a style object from another template',
        );
      },
    );
  });
}
