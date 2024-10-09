/**
 * This is the entry point function for the ui/layers/panels/filter test
 * @function panelFilterTest
 */
export function panelFilterTest() {

    codi.describe('UI Layers Panels: Filter', () => {
        /**
            * This function is used to test the creation of a filter panel
            * @function it
            */
        codi.it('Create a filter panel', () => {
            const layer = {
                key: 'panel_test',
                filter: {
                    current: {}
                },
                infoj: [
                    {
                        'field': 'field_1',
                        'filter': 'like',
                        'type': 'text'
                    },
                    {
                        'field': 'field_2',
                        'type': 'numeric',
                        'filter': {
                            'type': 'integer'
                        }
                    }
                ]
            }

            const filterPanel = mapp.ui.layers.panels.filter(layer)

            const filterPanelDropDown = filterPanel.querySelector('[data-id=panel_test-filter-dropdown]')

            const drop_down_elements = filterPanelDropDown.querySelector('ul');

            codi.assertEqual(drop_down_elements.children.length, 2, 'We expect two entries into the dropdown from the infoj')

        });
    });
}