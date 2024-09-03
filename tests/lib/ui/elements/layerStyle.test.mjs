
/**
 * ## layer.layerStyleTest()
 * @module ui/elements/layerStyle
 */
/**
 * This function is used as an entry point for the layerStyleTest
 * This test is used to test the creation of the style panel ui elements.
 * @function layerStyleTest 
*/
export async function layerStyleTest(mapview) {
    await codi.describe('UI elements: layerStyle', async () => {
        await codi.it('Should return a full layer style panel', async () => {
            const style = {
                hover: {
                    display: true,
                    title: 'Hover title',
                    field: 'hover_1',
                    label: 'I am a hover label'
                },
                hovers: {
                    hover_1: {
                        title: 'Hover title',
                        filed: 'hover_1',
                        display: true,
                        label: 'I am a hover label'
                    },
                    hover_2: {
                        title: 'Hover title 2',
                        filed: 'hover_2',
                        display: true,
                        label: 'I am a hover label'
                    }
                }
            };

            //get the workspace from the local files
            const layer = await mapview.layers['location_get_test'];

            layer.style = { ...layer.style, ...style };

            const panel = await mapp.ui.elements.layerStyle.panel(layer);
            console.log(panel);
        });
    });
}