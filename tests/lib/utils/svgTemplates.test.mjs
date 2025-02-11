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
     * ### We shouldn't be able to replace already existing templates
     * @function it
     */
    await codi.it('We should load new svg templates once', async () => {
      const svgTemplates = {
        dot_test: 'I am a bogus svg and shouldnt be loaded',
      };

      await mapp.utils.svgTemplates(svgTemplates);
      const dot_test_svg = await mapp.utils.svgSymbols.templates['dot_test'];
      codi.assertNotEqual(
        dot_test_svg,
        '',
        'The svg template should not be overwriten',
      );
    });
  });
}
