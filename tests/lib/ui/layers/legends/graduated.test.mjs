export function graduated(mapview) {
  codi.describe(
    {
      name: 'graduated style legend test:',
      id: 'ui_layers_legend_graduated',
      parentId: 'ui_layers',
    },
    () => {
      codi.it(
        {
          name: 'Create a graduated theme legend',
          parentId: 'ui_layers_legend_graduated',
        },
        () => {
          const style = {
            theme: {
              title: 'theme_1',
              field: 'test_template_style',
              graduated_breaks: 'greater_than',
              template: {
                key: 'test_template_style',
                template: '100-99',
                value_only: true,
              },
              type: 'graduated',
              categories: [
                {
                  value: 0,
                  label: '0 to 5%',
                  style: {
                    icon: {
                      type: 'target',
                      fillColor: '#ffffcc',
                      fillOpacity: 0.8,
                    },
                  },
                },
                {
                  value: 1,
                  label: '1%',
                  style: {
                    icon: {
                      type: 'target',
                      fillColor: '#ffffcc',
                      fillOpacity: 0.8,
                    },
                  },
                },
              ],
            },
          };

          const layer = {
            key: 'graduated_test',
            style: style,
            mapview: mapview,
          };

          // Call the graduatedTheme function
          ui.layers.legends.graduated(layer);

          // Get the legend
          const legend = layer.style.legend;

          // Ensure that the legend is defined
          codi.assertTrue(
            legend !== undefined,
            'Ensure that the legend is defined after calling graduatedTheme',
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

          // Check if the contents div has two divs within it (icon and label)
          codi.assertTrue(
            contentsWrapper.children.length >= 2,
            'Ensure that the contentsWrapper div contains at least two divs',
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
          const label1Div = contents.children[1];
          codi.assertTrue(
            label1Div.classList.contains('label'),
            'Ensure that the second div within contents has class "label" ',
          );

          // Check that the second div has class 'label'
          const value1Div = contents.getAttribute('data-id');
          codi.assertTrue(
            value1Div == 0,
            'Ensure that the first div within contents has "data-id" attribute equal to 0',
          );

          // Check that the second div has class 'label'
          const icon1Div = contents.children[0].querySelector('div');
          codi.assertTrue(
            icon1Div.classList.contains('legend-icon'),
            'Ensure that the first div within contents has class "legend-icon" ',
          );

          // Check if the contentsWrapper has a div with class 'contents'
          const contents2 = contentsWrapper.children[1];
          codi.assertTrue(
            contents2 !== null,
            'Ensure that the contentsWrapper contains a div with class "contents"',
          );

          // Check that the second div has class 'label'
          const label2Div = contents2.children[1];
          codi.assertTrue(
            label2Div.classList.contains('label'),
            'Ensure that the second div within contents has class "label" ',
          );

          // Check that the second div has class 'label'
          const value2Div = contents2.getAttribute('data-id');
          codi.assertTrue(
            value2Div == 1,
            'Ensure that the second div within contents has "data-id" attribute equal to 1',
          );

          // Check that the second div has class 'label'
          const icon2Div = contents2.children[0].querySelector('div');
          codi.assertTrue(
            icon2Div.classList.contains('legend-icon'),
            'Ensure that the second div within contents has class "legend-icon" ',
          );
        },
      );
    },
  );
}
