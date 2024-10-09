/**
 * @description This module is used to test the svgTemplates util
 * @module /lib/utils/svgTemplates
 */

/**
 * @description This is used as an  entry point for the test module
 * @function svgTemplatesTest
 */
export async function svgTemplatesTest() {
    await codi.describe('Utils: SVG Templates', async () => {

        /**
         * ### We should be able to load new svg templates with the util
         * @function it
         */
        await codi.it('We should load new svg templates', async () => {
            const svgTemplates = {
                'dot_test': 'https://geolytix.github.io/MapIcons/templates/dot_10px.svg',
                'target_test': 'https://geolytix.github.io/MapIcons/templates/target.svg',
                'square_test': 'https://geolytix.github.io/MapIcons/templates/square_10px.svg',
                'diamond_test': 'https://geolytix.github.io/MapIcons/templates/diamond_10px.svg',
                'triangle_test': 'https://geolytix.github.io/MapIcons/templates/triangle_10px.svg',
                'template_pin_test': 'https://geolytix.github.io/MapIcons/pins/pink_master_pin.svg'
            };

            await mapp.utils.svgTemplates(svgTemplates);

            const dot_test_svg = await mapp.utils.svgSymbols.templates['dot_test'];
            codi.assertTrue(!!dot_test_svg, 'We should be able to get a new svg template')
        });
        /**
         * ### We shouldn't be able to replace already existing templates
         * @function it
         */
        await codi.it('We should load new svg templates once', async () => {

            const svgTemplates = {
                'dot_test': 'I am a bogus svg and shouldnt be loaded',
            };

            await mapp.utils.svgTemplates(svgTemplates);
            const dot_test_svg = await mapp.utils.svgSymbols.templates['dot_test'];
            codi.assertNotEqual(dot_test_svg, '', 'The svg template should not be overwriten');

        });
    });
}