import geojsonLayerDefault from '../../assets/layers/geojson/layer.json';

export async function queryParams(mapview) {
  const originalConsole = console.warn;

  const mockWarn = [];

  console.warn = (message) => {
    mockWarn.push(message);
  };

  codi.describe(
    {
      id: 'utils_queryParams',
      name: 'queryParams:',
      parentId: 'utils',
    },
    () => {
      codi.it(
        {
          name: 'Providing a bogus param object',
          parentId: 'utils_queryParams',
        },
        () => {
          const origin = {
            queryParams: '',
          };

          mapp.utils.queryParams(origin);

          codi.assertEqual(mockWarn[0], 'queryparams must be an object');
        },
      );

      codi.it(
        { name: 'Providing a layer', parentId: 'utils_queryParams' },
        async () => {
          const layer_params = geojsonLayerDefault;
          const expected = {
            geom: 'different_geom',
            id: '1234',
            layer: 'queryParamsLayer',
            locale: 'locale',
            table: 'different_table',
            template: 'another_template',
          };

          layer_params.key = 'queryParamsLayer';

          layer_params.params = {
            fields: ['id', 'name', 'description', 'geom_4326'],
          };

          const [layer] = await mapview.addLayer(layer_params);

          const origin = {
            layer,
            location: {
              id: '1234',
            },
            queryparams: {
              email: 'test@email.com',
              filter: true,
              geom: 'different_geom',
              id: 1234,
              table: 'different_table',
              template: 'another_template',
            },
            viewport: {},
          };

          const queryparams = await mapp.utils.queryParams(origin);

          codi.assertEqual(queryparams.geom, expected.geom);
          codi.assertEqual(queryparams.id, expected.id);
          codi.assertEqual(queryparams.layer, expected.layer);
          codi.assertEqual(queryparams.locale, expected.locale);
          codi.assertEqual(queryparams.table, expected.table);
          codi.assertEqual(queryparams.template, expected.template);

          await mapview.removeLayer('queryParamsLayer');
        },
      );
    },
  );

  console.warn = originalConsole;
}
