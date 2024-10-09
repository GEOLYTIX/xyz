/**
 * This is the entry point function for the ui/layers/panels/filter test
 * @function panelFilterTest
 */
export function panelFilterTest() {

    /**
    * This function is used to test the creation of a filter panel
    * @function it
    */
    codi.it('Panel > Filter: create a filter panel', () => {
        const layer = {
            key:'panel_test',
            filter: {},
            infoj: [
                {
                    'field': 'filed_1',
                    'filter': 'like'
                },
                {
                    'field': 'filed_1',
                    'filter': {
                        'type':'integer'
                    }
                }
            ]
        }

        const filterPanel = mapp.ui.layers.panels.filter(layer)

        console.log(filterPanel)
    });
    
}