export async function featureFields() {
  await codi.describe(
    {
      name: 'featureFields test',
      id: 'layer_feature_fields',
      parentId: 'layer',
    },
    async () => {
      codi.it(
        {
          name: 'The fields array on a theme should not be duplicated',
          parentId: 'layer_feature_fields',
        },
        () => {
          const layer = {
            params: {
              default_fields: ['zIndex'],
            },
            style: {
              theme: {
                field: 'field_22',
                fields: [
                  'field_00',
                  'field_01',
                  'field_02',
                  'field_03',
                  'field_04',
                  'field_05',
                  'field_06',
                  'field_07',
                  'field_08',
                  'field_09',
                  'field_10',
                  'field_11',
                  'field_12',
                  'field_13',
                  'field_14',
                  'field_15',
                  'field_16',
                  'field_17',
                  'field_18',
                  'field_19',
                  'field_20',
                  'field_21',
                  'field_22',
                  'field_22',
                  'field_23',
                ],
              },
              label: { field: 'another_field' },
              icon_scaling: {
                field: 'another_field',
              },
              cluster: {
                label: 'another_field',
              },
            },
          };

          const featureArray = mapp.layer.featureFields.fieldsArray(layer);

          codi.assertNoDuplicates(featureArray);
        },
      );
      codi.it(
        {
          name: 'Using a field with distribution count should return the counts',
          parentId: 'layer_feature_fields',
        },
        async () => {
          const mapview = {
            srid: '3857',
          };

          const layer = {
            format: 'wkt',
            params: {
              fields: ['retailer'],
            },
            style: {
              default: {
                icon: {
                  type: 'dot',
                  fillColor: '#3193ED',
                },
              },
              theme: {
                field: 'retailer',
                type: 'categorized',
                distribution: 'count',
                categories: [
                  {
                    key: 'A',
                    style: {
                      icon: {
                        fillColor: '#3193ED',
                      },
                    },
                  },
                  {
                    key: 'B',
                    style: {
                      icon: {
                        fillColor: '#5DC29A',
                      },
                    },
                  },
                ],
              },
            },
            mapview,
          };

          // Add some WKT features to the layer
          const wktFeatures = [
            [1, 'POINT(-14400 6710852)', 'A'],
            [2, 'POINT(-14920 6711046)', 'A'],
            [3, 'POINT(-15322 6710796)', 'A'],
            [4, 'POINT(-15400 6710852)', 'B'],
          ];

          mapp.layer.featureFormats[layer.format](layer, wktFeatures);

          // Check the values
          codi.assertTrue(
            layer.featureFields['retailer']['A'] === 3,
            'Count for retailer A should be 3',
          );

          codi.assertTrue(
            layer.featureFields['retailer']['B'] === 1,
            'Count for retailer B should be 1',
          );
        },
      );
      codi.it(
        {
          name: 'Using a fields array with distribution count should return the counts',
          parentId: 'layer_feature_fields',
        },
        async () => {
          const mapview = {
            srid: '3857',
          };

          const layer = {
            format: 'wkt',
            params: {
              fields: ['retailer', 'open_close'],
            },
            style: {
              default: {
                icon: {
                  type: 'dot',
                  fillColor: '#3193ED',
                },
              },
              theme: {
                fields: ['retailer', 'open_close'],
                type: 'categorized',
                distribution: 'count',
                categories: [
                  {
                    key: 'A',
                    field: 'retailer',
                    style: {
                      icon: {
                        fillColor: '#3193ED',
                      },
                    },
                  },
                  {
                    key: 'B',
                    field: 'retailer',
                    style: {
                      icon: {
                        fillColor: '#5DC29A',
                      },
                    },
                  },
                  {
                    key: 'Open',
                    field: 'open_close',
                    style: {
                      icon: {
                        fillColor: '#8FE15A',
                      },
                    },
                  },
                  {
                    key: 'Close',
                    field: 'open_close',
                    style: {
                      icon: {
                        fillColor: '#D8D758',
                      },
                    },
                  },
                ],
              },
            },
            mapview,
          };

          const wktFeatures = [
            [1, 'POINT(-14400 6710852)', 'A', 'Open'],
            [2, 'POINT(-14920 6711046)', 'A', 'Close'],
            [3, 'POINT(-15322 6710796)', 'A', 'Open'],
            [4, 'POINT(-15400 6710852)', 'B', 'Open'],
          ];

          mapp.layer.featureFormats[layer.format](layer, wktFeatures);

          // Check the values
          codi.assertTrue(
            layer.featureFields['retailer']['A'] === 3,
            'Count for retailer A should be 3',
          );

          codi.assertTrue(
            layer.featureFields['retailer']['B'] === 1,
            'Count for retailer B should be 1',
          );

          codi.assertTrue(
            layer.featureFields['open_close']['Open'] === 3,
            'Count for Open should be 3',
          );

          codi.assertTrue(
            layer.featureFields['open_close']['Close'] === 1,
            'Count for Close should be 1',
          );
        },
      );
    },
  );
}
