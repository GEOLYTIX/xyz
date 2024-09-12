export async function featureFieldsTest() {
    await codi.describe('TODO: Layer: featureFieldsTest', async () => {
        await codi.it('The fields array on on a theme should not be duplicated', () => {

            const layer = {
                params: {
                    default_fields: ['zIndex']
                },
                style: {
                    theme: {
                        field: 'hours_index_22',
                        fields: [
                            'hours_index_00',
                            'hours_index_01',
                            'hours_index_02',
                            'hours_index_03',
                            'hours_index_04',
                            'hours_index_05',
                            'hours_index_06',
                            'hours_index_07',
                            'hours_index_08',
                            'hours_index_09',
                            'hours_index_10',
                            'hours_index_11',
                            'hours_index_12',
                            'hours_index_13',
                            'hours_index_14',
                            'hours_index_15',
                            'hours_index_16',
                            'hours_index_17',
                            'hours_index_18',
                            'hours_index_19',
                            'hours_index_20',
                            'hours_index_21',
                            'hours_index_22',
                            'hours_index_22',
                            'hours_index_23'
                        ]
                    },
                    label: { field: 'another_field' },
                    icon_scaling: {
                        field: 'another_field'
                    },
                    cluser: {
                        label: 'another_field'
                    }
                }
            }

            const featureArray = mapp.layer.featureFields.fieldsArray(layer);

            codi.assertNoDuplicates(featureArray);

        });
    });
}