import geojsonLayer from '../../../assets/layers/geojson/layer.json';
import layerStyleJson from '../../../assets/styles/ui_elements_layer_style.json';
/**
 * ## layer.layerStyleTest()
 * @module ui/elements/layerStyle
 */
/**
 * This function is used as an entry point for the layerStyleTest
 * This test is used to test the creation of the style panel ui elements.
 * @function layerStyleTest
 */
export function layerStyle(mapview) {
  codi.describe(
    {
      name: 'LayerStyle test:',
      id: 'ui_elements_layer_style',
      parentId: 'ui_elements',
    },
    async () => {
      const layerParams = {
        ...geojsonLayer,
        ...layerStyleJson,
      };

      layerParams.key = 'layer_style_test';

      const [layer] = await mapview.addLayer(layerParams);

      //Calling the panel function to create the panel with the layers style
      const panel = await mapp.ui.elements.layerStyle.panel(layer);

      //Opacity Slider
      codi.it(
        {
          name: 'The panel function should return a opacitySlider',
          parentId: 'ui_elements_layer_style',
        },
        () => {
          const opacitySlider = panel.querySelector(
            '[data-id="opacitySlider"]',
          );
          codi.assertTrue(
            !!opacitySlider,
            'The panel should have a opacitySlider',
          );
        },
      );

      //Hover checkbox
      codi.it(
        {
          name: 'The panel function should return a hover check box',
          parentId: 'ui_elements_layer_style',
        },
        () => {
          const hoverCheckBox = panel.querySelector(
            '[data-id="hoverCheckbox"]',
          );
          codi.assertTrue(
            !!hoverCheckBox,
            'The panel should have a hoverCheckBox',
          );
        },
      );

      //hovers dropdown
      codi.it(
        {
          name: 'The panel function should return a hovers dropdown',
          parentId: 'ui_elements_layer_style',
        },
        () => {
          const hoversDropDown = panel.querySelector(
            '[data-id="hoversDropdown"]',
          );
          codi.assertTrue(
            !!hoversDropDown,
            'The panel should have a hoversDropdown',
          );
        },
      );

      //layer theme
      codi.it(
        {
          name: 'The panel function should return a layerTheme',
          parentId: 'ui_elements_layer_style',
        },
        () => {
          const layerTheme = panel.querySelector('[data-id="layerTheme"]');
          codi.assertTrue(!!layerTheme, 'The panel should have a layerTheme');
        },
      );

      //Themes dropdown
      codi.it(
        {
          name: 'The panel function should return a themes dropdown',
          parentId: 'ui_elements_layer_style',
        },
        () => {
          const themesDropdown = panel.querySelector(
            '[data-id="themesDropdown"]',
          );
          codi.assertTrue(
            !!themesDropdown,
            'The panel should have a themes dropdown',
          );
        },
      );

      //icon scaling checkbox
      codi.it(
        {
          name: 'The panel function should return an icon scaling field checkbox',
          parentId: 'ui_elements_layer_style',
        },
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
      codi.it(
        {
          name: 'The panel function should return an icon scaling slider',
          parentId: 'ui_elements_layer_style',
        },
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
      codi.it(
        {
          name: 'The panel function should return an icon scaling cluster slider',
          parentId: 'ui_elements_layer_style',
        },
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
      codi.it(
        {
          name: 'The panel function should return an icon scaling zoom in slider',
          parentId: 'ui_elements_layer_style',
        },
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
      codi.it(
        {
          name: 'The panel function should return an icon scaling zoom out slider',
          parentId: 'ui_elements_layer_style',
        },
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

      await mapview.removeLayer(layerParams.key);
    },
  );
}
