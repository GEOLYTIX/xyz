/**
 * @module lib/ui/elements/layers/panels/filters
 */
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
                reload: () => { },
                mapview: {
                    Map: {
                        getTargetElement: () => { return document.getElementById('Map') }
                    }
                },
                key: 'panel_test',
                filter: {
                    current: {}
                },
                hideCallbacks: [],
                showCallbacks: [],
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

            filterPanel.querySelector('ul').children[0].dispatchEvent(new Event('click'))

            codi.assertEqual(filterPanel.querySelector('ul').children[0].classList.contains('selected'), true, 'Expect an element to be selected')

            const resetButton = filterPanel.querySelector('[data-id=resetall]')

            layer.filter.current['field_1'] ??= { 'like': 'a' }

            resetButton.dispatchEvent(new Event('click'))

            codi.assertEqual(layer.filter.current, {}, ' `layer.current.filter` should be empty')

        });
    });
}