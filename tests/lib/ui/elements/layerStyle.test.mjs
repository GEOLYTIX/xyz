
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

            //Style object that we will use to create the entire panel
            const style = {
                opacitySlider: true,
                hover: {
                    display: true,
                    title: 'Hover title',
                    field: 'hover_1',
                    label: 'I am a hover label'
                },
                hovers: {
                    hover_1: {
                        title: 'Hover title',
                        field: 'hover_1',
                        display: true,
                        label: 'I am a hover label'
                    },
                    hover_2: {
                        title: 'Hover title 2',
                        field: 'hover_2',
                        display: true,
                        label: 'I am a hover label'
                    }
                },
                label: 'label_2',
                labels: {
                    label_1: {
                        title: 'Label title',
                        display: true,
                        field: 'label_1',
                        label: 'I am labels label'
                    },
                    label_2: {
                        title: 'Label title 2',
                        display: true,
                        field: 'label_2',
                        label: 'I am a labels label'
                    }
                },
                theme: {
                    title: 'Theme title',
                    type: 'categorized',
                    field: 'foo',
                    other: true,
                    categories: [
                        {
                            key: 'category_1',
                            style: {
                                strokeColor: '#000',
                                fillColor: '#000',
                                fillOpacity: 0.5,
                                strokeWidth: 3
                            }
                        },
                        {
                            key: 'category_2',
                            style: {
                                strokeColor: '#000',
                                fillColor: '#000',
                                fillOpacity: 0.5,
                                strokeWidth: 3
                            }
                        },
                        {
                            key: 'category_3',
                            style: {
                                strokeColor: '#000',
                                fillColor: '#000',
                                fillOpacity: 0.5,
                                strokeWidth: 3
                            }
                        }
                    ]
                }
            };

            //get the workspace from the local files
            const layer = await mapview.layers['location_get_test'];

            delete layer.style.elements;

            //spreading the style to the layer style object
            layer.style = { ...layer.style, ...style };

            //Calling the panel function to create the panel with the layers style
            const panel = await mapp.ui.elements.layerStyle.panel(layer);

            console.log(panel);

            const opacitySlider = panel.querySelector('[data-id="opacitySlider"]')
            codi.assertTrue(!!opacitySlider, 'The panel should have a opacitySlider');
            const hoverCheckBox = panel.querySelector('[data-id="hoverCheckbox"]');
            codi.assertTrue(!!hoverCheckBox, 'The panel should have a hoverCheckBox');
            const hoversDropDown = panel.querySelector('[data-id="hoversDropdown"]');
            codi.assertTrue(!!hoversDropDown, 'The panel should have a hoversDropdown');
            const layerTheme = panel.querySelector('[data-id="layerTheme"]');
            codi.assertTrue(!!layerTheme, 'The panel should have a layerTheme');


        });
    });
}