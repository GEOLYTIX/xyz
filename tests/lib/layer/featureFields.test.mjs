export async function featureFieldsTest() {
  await codi.describe('TODO: Layer: featureFieldsTest', async () => {
    await codi.it(
      'The fields array on on a theme should not be duplicated',
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
            cluser: {
              label: 'another_field',
            },
          },
        };

        const featureArray = mapp.layer.featureFields.fieldsArray(layer);

        codi.assertNoDuplicates(featureArray);
      },
    );
  });
}
