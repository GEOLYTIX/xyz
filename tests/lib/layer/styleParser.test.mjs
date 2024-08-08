export async function styleParserTest(mapview) {
  await codi.describe('TODO: Layer: styleParserTest', async () => {
    const workspace = await mapp.utils.xhr(`/test/tests/workspace.json`);
    const layer = workspace.locale.layers['styleParser'];
    layer.key = 'Style Parser Test';
    await mapp.layer.styleParser(layer);

    await codi.it('The Layer should have a default object', () => {
      codi.assertTrue(!!layer.style.default, 'The Layer should always have a default object')
    });

    await codi.it('The parser should remove the hover object, and add it into the layer.style object', () => {
      codi.assertTrue(!layer.hover, 'The layer shouldnt have a layer.hover object')
      codi.assertTrue(!!layer.style.hover, 'The layer should have a layer.style.hover object')
    });

    await codi.it('The parse should remove the label property if both labels and label are present', () => {
      codi.assertTrue(!layer.style.label, 'The layer shouldnt have a layer.style.label object')
      codi.assertTrue(!!layer.style.labels, 'The layer should have a layer.style.labels object')
    });

    console.warn('The Style parse modules need to be broken up and exported for easier testability');
  });
}