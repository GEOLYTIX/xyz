
export async function sliderTest() {
    await codi.describe('UI elements: slider', async () => {
        await codi.it('Should return an slider', async () => {
            const workspace = await mapp.utils.xhr(`/test/tests/workspace.json`);
            const layer = workspace.locale.layers['input_slider'];
            const input_slider_params = layer.infoj.filter(entry => entry.field === 'integer_field');
            const input_slider = mapp.ui.elements.slider(input_slider_params[0]);

            const input_slider_element = input_slider.getElementsByTagName('input')[1];
            const assert_input = `<input data-id="a" name="rangeInput" type="range" min="-100000" max="10000" step="1">`;
            codi.assertEqual(input_slider_element.outerHTML, assert_input, 'We expect to see the input defined in the test');
        });
    });
}