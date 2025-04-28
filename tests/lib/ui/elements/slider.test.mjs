import sliderInfoj from '../../../assets/infoj/slider.json';
import geojsonLayer from '../../../assets/layers/geojson/layer.json';
/**
 * @module ui/elements/slider
 */

/**
 * This function is used as an entry point for the sliderTest
 * This test is used to test the creation of the slider ui element.
 * **Note: I still want to figure out event management for these elements to trigger the oninput function to simulate sliding the element**
 * @function sliderTest
 */
export async function slider(mapview) {
  codi.describe(
    { name: 'Slider test:', id: 'ui_elements_slider', parentId: 'ui_elements' },
    () => {
      codi.it(
        { name: 'Should return the slider', parentId: 'ui_elements_slider' },
        async () => {
          const layerParams = {
            ...geojsonLayer,
            ...sliderInfoj,
          };

          layerParams.key = 'slider_test';

          const [layer] = await mapview.addLayer(layerParams);

          const inputSliderParams = layer.infoj.filter(
            (entry) => entry.field === 'integer_field',
          );
          //Getting the params for the slider
          const inputSlider = mapp.ui.elements.slider(inputSliderParams[0]);

          //Getting the created input slider element and asserting the exected value
          const inputSliderElement =
            inputSlider.getElementsByTagName('input')[1];
          const assertInput = `<input data-id="a" name="rangeInput" type="range" min="-100000" max="10000" step="1">`;
          codi.assertEqual(
            inputSliderElement.outerHTML,
            assertInput,
            'We expect to see the input defined in the test',
          );

          await mapview.removeLayer('slider_test');
        },
      );
    },
  );
}
