/**
 * @module lib/ui/locations/entries/geometries 
 */

/**
 * Entry point for the geometry test module
 * @function geometryTest 
 * @param {object} mapview 
 */
export async function geometryTest(mapview) {
    await codi.describe('UI Entries: Geometry', async () => {
        const entry = {
            mapview: mapview,
            key: 'geometry-test',
            value: {
                type: 'Point',
                coordinates: '0101000020110F000065D98262C7490CC10DF78253F7B75D41',
            },
            srid: 3856,
            display: true,
            location: {
                layer: {
                    mapview: mapview
                },
                Layers: []
            }
        }

        /**
         * @description Should return geometry checkbox
         * @function it
         */
        await codi.it('Should return geometry checkbox', async () => {

            const geometryCheckBox = mapp.ui.locations.entries.geometry(entry);
            codi.assertTrue(!!geometryCheckBox, 'A checkbox needs to be returned');
        });

        /**
         * @description Should return 0 if no entry value is provided
         * @function it
         */
        await codi.it('Should return 0 if no entry value is provided', async () => {
            entry.value = null;
            const geometryCheckBox = await mapp.ui.locations.entries.geometry(entry);
            codi.assertTrue(typeof geometryCheckBox === 'undefined', 'We need to get no geometry checkbox returned');
        });
    })
}