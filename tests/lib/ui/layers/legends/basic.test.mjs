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
          ui.layers.legends.basic(layer);

          // Get the legend
          const legend = layer.style.legend;

          // Ensure that the legend is defined
          codi.assertTrue(
            legend !== undefined,
            'Ensure that the legend is defined after calling basicTheme',
          );

          codi.assertTrue(
            legend instanceof HTMLElement,
            'Ensure that the legend is a HTMLElement',
          );

          // Check if the legend has a div of 'contents-wrapper grid' within it
          const contentsWrapper = legend.querySelector(
            'div.contents-wrapper.grid',
          );
          codi.assertTrue(
            contentsWrapper !== null,
            'Ensure that the legend contains a div with class "contents-wrapper grid"',
          );

          // Check if the contentsWrapper has a div with class 'contents'
          const contents = contentsWrapper.querySelector('div.contents');
          codi.assertTrue(
            contents !== null,
            'Ensure that the contentsWrapper contains a div with class "contents"',
          );

          // Check if the contents div has two divs within it (icon and label)
          codi.assertTrue(
            contents.children.length === 2,
            'Ensure that the contents div contains exactly two divs',
          );

          // Check that the second div has class 'label'
          const labelDiv = contents.children[1];
          codi.assertTrue(
            labelDiv.classList.contains('label'),
            'Ensure that the second div within contents has class "label"',
          );
        },
      );
    },
  );
}
