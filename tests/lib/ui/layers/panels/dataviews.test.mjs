import dataviews_panel from '../../../../assets/dataviews/dataviews_panel.json';
export function dataviews(mapview) {
  codi.describe(
    {
      name: 'dataview panel test:',
      id: 'ui_layers_panel_dataviews',
      parentId: 'ui_layers',
    },
    () => {
      codi.it(
        {
          name: 'Create dataview panel',
          parentId: 'ui_layers_panel_dataviews',
        },
        () => {
          const dataviews = JSON.parse(JSON.stringify(dataviews_panel));

          const layer = {
            mapview: mapview,
            dataviews: dataviews.dataviews,
            showCallbacks: [],
            hideCallbacks: [],
          };

          const drawer = ui.layers.panels.dataviews(layer);

          codi.assertTrue(
            drawer.childNodes.length > 0,
            'Ensure that we have children being added into the panel',
          );
        },
      );
    },
  );
}
