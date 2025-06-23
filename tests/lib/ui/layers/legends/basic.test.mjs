export function basic(mapview) {
  codi.describe(
    {
      name: 'basic style legend test:',
      id: 'ui_layers_legend_basic',
      parentId: 'ui_layers',
    },
    () => {
      codi.it(
        {
          name: 'Create a basic theme legend',
          parentId: 'ui_layers_legend_basic',
        },
        () => {
          const style = {
            theme: {
              type: 'basic',
              style: {
                fillColor: '#aaaaaa',
                strokeColor: '#aaaaaa',
                strokeWidth: 1,
                fillOpacity: 0.5,
                width: 24,
                height: 24,
              },
            },
          };

          const layer = {
            key: 'basic_test',
            style: style,
            mapview: mapview,
          };

          // Call the basicTheme function
          mapp.ui.layers.legend.basic(layer);

          // Check that the legend node is created and holds a div of class 'legend'
          const legendNode = layer.style.legend;
          codi.assertTrue(
            legendNode instanceof HTMLElement,
            'Ensure that the legend node is an HTMLElement',
          );

          codi.assertTrue(
            legendNode.classList.contains('legend'),
            'Ensure that the legend node has the class "legend"',
          );

          // Check that the legend node contains a div with class 'contents-wrapper grid'
          const contentsWrapper = legendNode.querySelector(
            '.contents-wrapper.grid',
          );

          codi.assertTrue(
            contentsWrapper instanceof HTMLElement,
            'Ensure that the contents-wrapper is an HTMLElement',
          );

          // Check that the contents-wrapper contains a div with class 'contents'
          const contents = contentsWrapper.querySelector('.contents');
          codi.assertTrue(
            contents instanceof HTMLElement,
            'Ensure that the contents is an HTMLElement',
          );
        },
      );
    },
  );
}
