import { it, describe, assertTrue } from 'https://esm.sh/codi-test-framework@0.0.29';
export async function styleParserTest(mapview) {
  await describe('TODO: Layer: styleParserTest', async () => {
    const workspace = await mapp.utils.xhr(`/test/tests/workspace.json`);
    const layer = workspace.locale.layers['styleParser'];
    await mapp.layer.styleParser(layer);

    await it('The Layer should have a default object', () => {
      assertTrue(!!layer.style.default, 'The Layer should always have a default object')
    });
  });
}