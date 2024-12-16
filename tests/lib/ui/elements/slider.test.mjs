import geojson_layer from '../../../assets/layers/geojson/layer.json';
import slider_infoj from '../../../assets/infoj/slider.json';
/**
 * ## layer.decorateTest()
 * @module ui/elements/slider
 */

/**
 * This function is used as an entry point for the sliderTest
 * This test is used to test the creation of the slider ui element.
 * **Note: I still want to figure out event management for these elements to trigger the oninput function to simulate sliding the element**
 * @function sliderTest 
*/
export async function sliderTest(mapview) {
    codi.describe({ name: 'Slider test:', id: 'ui_elements_slider', parentId: 'ui_elements' }, () => {
        codi.it({ name: 'Should return the slider', parentId: 'ui_elements_slider' }, async () => {

            const layer_params = {
                ...geojson_layer,
                ...slider_infoj
            }

            layer_params.key = 'slider_test';

            const layers = await mapview.addLayer(layer_params);

            const layer = layers[0];

            const input_slider_params = layer.infoj.filter(entry => entry.field === 'integer_field');
            //Getting the params for the slider
            const input_slider = mapp.ui.elements.slider(input_slider_params[0]);

            //Getting the created input slider element and asserting the exected value
            const input_slider_element = input_slider.getElementsByTagName('input')[1];
            const assert_input = `<input data-id="a" name="rangeInput" type="range" min="-100000" max="10000" step="1">`;
            codi.assertEqual(input_slider_element.outerHTML, assert_input, 'We expect to see the input defined in the test');

            await mapview.removeLayer('slider_test')
        });
    });
}