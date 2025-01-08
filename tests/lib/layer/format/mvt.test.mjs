import mvt_layer_default from '../../../assets/layers/mvt/layer.json';

export function mvt(mapview, layer) {
  layer ??= mvt_layer_default;

  codi.describe(
    { name: 'MVT:', id: 'layer_format_mvt', parentId: 'layer_format' },
    () => {
      /**
       * @description MVT: Create basic layer
       * @function it
       */
      codi.it(
        { name: 'Create basic layer', parentId: 'layer_format_mvt' },
        () => {
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
        },
      );
    },
  );
}
