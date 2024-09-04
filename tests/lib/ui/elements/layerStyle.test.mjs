
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
                },
                label: {
                    title: 'Label Title',
                    display: true,
                    field: 'label_1'
                },
                labels: {
                    label_1: {
                        title: 'Label title',
                        filed: 'label_1',
                        display: true,
                        label: 'I am labels label'
                    },
                    label_2: {
                        title: 'Label title 2',
                        filed: 'label_2',
                        display: true,
                        label: 'I am a labels label'
                    }
                }
            };

            //get the workspace from the local files
            const layer = await mapview.layers['location_get_test'];

            layer.style = { ...layer.style, ...style };

            const panel = await mapp.ui.elements.layerStyle.panel(layer);

            console.log(panel);
            const hoverCheckBox = panel.querySelector('[data-id="hoverCheckbox"]');
            codi.assertTrue(!!hoverCheckBox, 'The panel should have a hoverCheckBox');
            const hoverDropDown = panel.querySelector('[data-id="dropdown"]');
            console.log(hoverDropDown);
        });
    });
}