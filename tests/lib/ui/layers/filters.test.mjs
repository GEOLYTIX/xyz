export async function filtersTest() {
    codi.desribe('UI Layers: Filters test', async () => {
        codi.it('Should generate correct min/max values', async () => {

            const minMax = mapp.ui.layers.filters.generateMinMax();
            console.log(minMax)
        });
    });
}