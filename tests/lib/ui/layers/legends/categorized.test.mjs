export function categorized(mapview) {
  codi.describe(
    {
      name: 'categorized style legend test:',
      id: 'ui_layers_legend_categorized',
      parentId: 'ui_layers',
    },
    () => {
      codi.it(
        {
          name: 'Create a categorized theme legend',
          parentId: 'ui_layers_legend_categorized',
        },
        () => {
          const style = {
            theme: {
              title: 'theme_1',
              field: 'numeric_field',
              type: 'categorized',
              categories: [
                {
                  value: 0,
                  field: 'field1',
                  label: 'Category 1',
                  icon: {
                    type: 'dot',
                    fillColor: '#red',
                  },
                },
                {
                  value: 1,
                  field: 'field2',
                  label: 'Category 2',
                  style: {
                    icon: {
                      type: 'svg',
                      svg: '<svg>...</svg>',
                    },
                  },
                },
              ],
            },
          };

          const layer = {
            key: 'categorized_test',
            style: style,
            mapview: mapview,
          };

          // Call the categorizedTheme function
          ui.layers.legends.categorized(layer);

          // Get the legend
          const legend = layer.style.legend;

          // Ensure that the legend is defined
          codi.assertTrue(
            legend !== undefined,
            'Ensure that the legend is defined after calling categorizedTheme',
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
