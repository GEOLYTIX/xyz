/**
 * @module lib/ui/elements/layers/panels/filters
 */
/**
 * This is the entry point function for the ui/layers/panels/filter test
 * @function panelFilterTest
 */
export function filter() {
  codi.describe(
    {
      name: 'Panel Filter test:',
      id: 'ui_layers_panel_filter',
      parentId: 'ui_layers',
    },
    () => {
      const layer = {
        reload: () => {},
        mapview: {
          Map: {
            getTargetElement: () => {
              return document.getElementById('Map');
            },
          },
        },
        key: 'panel_test',
        filter: {
          current: {},
        },
        hideCallbacks: [],
        showCallbacks: [],
        infoj: [
          {
            field: 'field_1',
            filter: 'like',
            type: 'text',
          },
          {
            field: 'field_2',
            type: 'numeric',
            filter: {
              type: 'integer',
            },
          },
        ],
      };

      /**
       * This function is used to test the creation of a filter panel
       * @function it
       */
      codi.it(
        { name: 'Create a filter panel', parentId: 'ui_layers_panel_filter' },
        () => {
          const filterPanel = mapp.ui.layers.panels.filter(layer);
          const filterPanelDropDown = filterPanel.querySelector(
            '[data-id=panel_test-filter-dropdown]',
          );

          const drop_down_elements =
            filterPanelDropDown.querySelectorAll('option');

          codi.assertEqual(
            drop_down_elements.length,
            3,
            'We expect three entries into the dropdown from the infoj',
          );

          filterPanelDropDown[1].dispatchEvent(new Event('click'));

          const resetButton = filterPanel.querySelector('[data-id=resetall]');

          layer.filter.current['field_1'] ??= { like: 'a' };

          resetButton.dispatchEvent(new Event('click'));

          codi.assertEqual(
            layer.filter.current,
            {},
            '`layer.current.filter` should be empty',
          );
        },
      );
      /**
       * This function is used to test the creation of a filter panel in a dialog
       * @function it
       */
      codi.it(
        { name: 'Create a filter dialog', parentId: 'ui_layers_panel_filter' },
        () => {
          layer.filter.dialog = true;

          const filterDrawer = mapp.ui.layers.panels.filter(layer);

          codi.assertTrue(
            layer.filter.dialog_btn instanceof HTMLElement,
            'we expect a button to be created',
          );
        },
      );
    },
  );
}
