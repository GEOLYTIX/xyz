export async function geometryTest(mapview) {
    await codi.describe('UI Entries: Geometry', async () => {
        await codi.it('Should return geometry checkbox', async () => {
            const entry = {
                mapview: mapview,
                key: 'geometry-test',
                value: {
                    type: 'Point',
                    coordinates: '0101000020110F000065D98262C7490CC10DF78253F7B75D41',
                },
                srid: 3856,
                display: false
            }

            const geometryCheckBox = mapp.ui.locations.entries.geometry(entry);
            codi.assertTrue(!!geometryCheckBox, 'A checkbox needs to be returned');
        });
    })
}