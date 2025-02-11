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
export async function sliderTest() {
  await codi.describe('UI elements: slider', async () => {
    await codi.it('Should return the slider', async () => {
      //get the workspace from the local files
      const workspace = await mapp.utils.xhr(`/test/tests/workspace.json`);
      const layer = workspace.locale.layers['input_slider']; //Get the input slider layer that we can get the params for.

      const input_slider_params = layer.infoj.filter(
        (entry) => entry.field === 'integer_field',
      );
      //Getting the params for the slider
      const input_slider = mapp.ui.elements.slider(input_slider_params[0]);

      //Getting the creating input slider element and asserting the exected value
      const input_slider_element =
        input_slider.getElementsByTagName('input')[1];
      const assert_input = `<input data-id="a" name="rangeInput" type="range" min="-100000" max="10000" step="1">`;
      codi.assertEqual(
        input_slider_element.outerHTML,
        assert_input,
        'We expect to see the input defined in the test',
      );
    });
  });
}
