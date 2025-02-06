export async function getLayerTest() {
  codi.describe(
    {
      name: 'Layers',
      id: 'api_workspace_layer',
      parentId: 'api_workspace',
    },
    async () => {
      const locales = await mapp.utils.xhr(`/test/api/workspace/locales`);
      const locale = await mapp.utils.xhr(
        `/test/api/workspace/locale?locale=${locales[0].key}`,
      );

      codi.it(
        {
          name: 'Getting template_test Layer',
          parentId: 'api_workspace_layer',
        },
        async () => {
          const layer = await mapp.utils.xhr(
            `/test/api/workspace/layer?layer=${locale.layers[0]}`,
          );

          codi.assertTrue(
            Object.hasOwn(layer, 'key'),
            'A Layer should have a key',
          );

          codi.assertTrue(
            Object.hasOwn(layer, 'name'),
            'A Layer should have a name',
          );

          codi.assertTrue(
            Object.hasOwn(layer, 'format'),
            'A Layer should have a format',
          );
        },
      );
    },
  );
}
