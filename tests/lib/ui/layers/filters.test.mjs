export async function filtersTest(mapview) {
    codi.describe('UI Layers: Filters test', async () => {
        codi.it('Should generate correct min/max values', async () => {

            const filter = {
                field: 'field'
            };

            const layer = mapview.layers['location_get_test'];

            console.log(layer);

            const minMax = mapp.ui.layers.filters.generateMinMax(layer, filter);
            console.log(minMax)
        });
    });
}