import mvt_layer_default from '../../../assets/layers/mvt/layer.json';

export function mvtTest(mapview, layer) {
  layer ??= mvt_layer_default;

  codi.describe('Layer Format: MVT', () => {
    /**
     * @description MVT: Create basic layer
     * @function it
     */
    codi.it('MVT: Create basic layer', () => {
      mapp.layer.formats[layer.format]?.(layer);

      codi.assertTrue(
        Object.hasOwn(layer, 'reload'),
        'The mvt layer needs to have a reload function',
      );
      codi.assertTrue(
        Object.hasOwn(layer, 'featureSource'),
        'The mvt layer needs to have a featureSource',
      );
      codi.assertTrue(
        Object.hasOwn(layer, 'source'),
        'The mvt layer needs to have a source',
      );
      codi.assertTrue(
        Object.hasOwn(layer, 'L'),
        'The mvt layer needs to have an openlayer object',
      );
    });
  });
}
