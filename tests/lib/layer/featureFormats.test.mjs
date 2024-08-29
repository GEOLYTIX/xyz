export async function featureFormatsTest() {
  codi.describe('Layer: featureFormatsTest', () => {
    codi.it('Test style.icon_scaling for WKT features', () => {

      const mapview = {
        srid: '3857'
      }

      const layer = {
        format: 'wkt',
        params: {
          fields: [
            size
          ]
        },
        style: {
          icon_scaling: {
            field: 'size'
          }
        },
        mapview
      }

      const features = [
        [
          1,
          'POINT(-14400 6710852)',
          null
        ],
        [
          2,
          'POINT(-14920 6711046)',
          10
        ],
        [
          3,
          'POINT(-15322 6710796)',
          15
        ]
      ]

      mapp.layer.featureFormats[layer.format](layer, features)

      codi.assertEqual(layer.style.icon_scaling.max, 15, 'The Icon scaling max should equal to 15')
    });
  });
}
