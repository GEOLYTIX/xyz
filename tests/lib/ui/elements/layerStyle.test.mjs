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
    //Style object that we will use to create the entire panel
    const style = {
      opacitySlider: true,
      cluster: {
        clusterScale: 5,
      },
      icon_scaling: {
        field: 'size',
        icon: true,
        clusterScale: true,
        zoomInScale: true,
        zoomOutScale: true,
      },
      hover: {
        display: true,
        title: 'Hover title',
        field: 'hover_1',
        label: 'I am a hover label',
      },
      hovers: {
        hover_1: {
          title: 'Hover title',
          field: 'hover_1',
          display: true,
          label: 'I am a hover label',
        },
        hover_2: {
          title: 'Hover title 2',
          field: 'hover_2',
          display: true,
          label: 'I am a hover label',
        },
      },
      label: 'label_2',
      labels: {
        label_1: {
          title: 'Label title',
          display: true,
          field: 'label_1',
          label: 'I am labels label',
        },
        label_2: {
          title: 'Label title 2',
          display: true,
          field: 'label_2',
          label: 'I am a labels label',
        },
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
              strokeWidth: 3,
            },
          },
          {
            key: 'category_2',
            style: {
              strokeColor: '#000',
              fillColor: '#000',
              fillOpacity: 0.5,
              strokeWidth: 3,
            },
          },
          {
            key: 'category_3',
            style: {
              strokeColor: '#000',
              fillColor: '#000',
              fillOpacity: 0.5,
              strokeWidth: 3,
            },
          },
        ],
      },
      themes: {
        first_theme: {
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
                strokeWidth: 3,
              },
            },
            {
              key: 'category_2',
              style: {
                strokeColor: '#000',
                fillColor: '#000',
                fillOpacity: 0.5,
                strokeWidth: 3,
              },
            },
            {
              key: 'category_3',
              style: {
                strokeColor: '#000',
                fillColor: '#000',
                fillOpacity: 0.5,
                strokeWidth: 3,
              },
            },
          ],
        },
        second_theme: {
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
                strokeWidth: 3,
              },
            },
            {
              key: 'category_2',
              style: {
                strokeColor: '#000',
                fillColor: '#000',
                fillOpacity: 0.5,
                strokeWidth: 3,
              },
            },
            {
              key: 'category_3',
              style: {
                strokeColor: '#000',
                fillColor: '#000',
                fillOpacity: 0.5,
                strokeWidth: 3,
              },
            },
          ],
        },
      },
    };

    //get the workspace from the local files
    const layer = await mapview.layers['location_get_test'];

    //This will be defaulted on decorated layers.
    //We need to remove this for new elements to be passed in on the panel function.
    delete layer.style.elements;

    //spreading the style to the layer style object
    layer.style = { ...layer.style, ...style };

    //Calling the panel function to create the panel with the layers style
    const panel = await mapp.ui.elements.layerStyle.panel(layer);

    //Opacity Slider
    await codi.it(
      'The panel function should return a opacitySlider',
      async () => {
        const opacitySlider = panel.querySelector('[data-id="opacitySlider"]');
        codi.assertTrue(
          !!opacitySlider,
          'The panel should have a opacitySlider',
        );
      },
    );

    //Hover checkbox
    await codi.it('The panel function should return a hover check box', () => {
      const hoverCheckBox = panel.querySelector('[data-id="hoverCheckbox"]');
      codi.assertTrue(!!hoverCheckBox, 'The panel should have a hoverCheckBox');
    });

    //hovers dropdown
    await codi.it('The panel function should return a hovers dropdown', () => {
      const hoversDropDown = panel.querySelector('[data-id="hoversDropdown"]');
      codi.assertTrue(
        !!hoversDropDown,
        'The panel should have a hoversDropdown',
      );
    });

    //layer theme
    await codi.it('The panel function should return a layerTheme', () => {
      const layerTheme = panel.querySelector('[data-id="layerTheme"]');
      codi.assertTrue(!!layerTheme, 'The panel should have a layerTheme');
    });

    //Themes dropdown
    await codi.it('The panel function should return a themes dropdown', () => {
      const themesDropdown = panel.querySelector('[data-id="themesDropdown"]');
      codi.assertTrue(
        !!themesDropdown,
        'The panel should have a themes dropdown',
      );
    });

    //icon scaling checkbox
    await codi.it(
      'The panel function should return an icon scaling field checkbox',
      () => {
        const iconScalingFieldCheckBox = panel.querySelector(
          '[data-id="iconScalingFieldCheckbox"]',
        );
        codi.assertTrue(
          !!iconScalingFieldCheckBox,
          'The panel should have an icon scaling field check box',
        );
      },
    );

    //icon scaling slider
    await codi.it(
      'The panel function should return an icon scaling slider',
      () => {
        const iconScalingSlider = panel.querySelector(
          '[data-id="iconScalingSlider"]',
        );
        codi.assertTrue(
          !!iconScalingSlider,
          'The panel should have an icon scaling slider',
        );
      },
    );

    //icon scaling cluster slider
    await codi.it(
      'The panel function should return an icon scaling cluster slider',
      () => {
        const iconScalingClusterSlider = panel.querySelector(
          '[data-id="iconScalingClusterSlider"]',
        );
        codi.assertTrue(
          !!iconScalingClusterSlider,
          'The panel should have an icon scaling cluser slider',
        );
      },
    );

    //icon scaling zoom in slider
    await codi.it(
      'The panel function should return an icon scaling zoom in slider',
      () => {
        const iconScalingZoomInSlider = panel.querySelector(
          '[data-id="iconScalingZoomInSlider"]',
        );
        codi.assertTrue(
          !!iconScalingZoomInSlider,
          'The panel should have an icon scaling zoom in slider',
        );
      },
    );

    //icon scaling zoom out slider
    await codi.it(
      'The panel function should return an icon scaling zoom out slider',
      () => {
        const iconScalingZoomOutSlider = panel.querySelector(
          '[data-id="iconScalingZoomOutSlider"]',
        );
        codi.assertTrue(
          !!iconScalingZoomOutSlider,
          'The panel should have an icon scaling zoom out slider',
        );
      },
    );
  });
}
