export async function featureStyleTest(mapview) {
    await codi.describe('TODO: Layer: featureStyleTest', async () => {
        await codi.it('featureStyle: Icon Scaling', async () => {
            await mapp.utils.xhr(`/test/api/query?template=icon_scaling_scratch&value=null`);
            const layer = mapview.layers['icon_scaling'];
            const lastLocation = await mapp.utils.xhr(`${mapp.host}/api/query?template=get_last_location&locale=locale&layer=icon_scaling`);

            const location = await mapp.location.get({
                layer: layer,
                id: lastLocation.id,
            });

            location.infoj = location.infoj.map(entry => {
                if (entry.field === 'icon_scale') {
                    entry.newValue = 300;
                }
                return entry;
            });

            await location.update();
            codi.assertEqual(layer.style.icon_scaling.max, 300, 'After updating a location the max value should be 300');
        });
    });
}
