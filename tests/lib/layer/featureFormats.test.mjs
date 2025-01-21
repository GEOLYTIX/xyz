export function featureFormats() {
  codi.describe(
    {
      name: 'featureFormats test',
      id: 'layer_feature_formats',
      parentId: 'layer',
    },
    () => {
      const mapview = {
        srid: '3857',
      };

      const layer = {
        format: 'wkt',
        params: {
          fields: ['size'],
        },
        style: {
          icon_scaling: {
            field: 'size',
          },
          hover: {
            field: 'id',
          },
        },
        mapview,
      };

      const wktFeatures = [
        [1, 'POINT(-14400 6710852)', null],
        [2, 'POINT(-14920 6711046)', 10],
        [3, 'POINT(-15322 6710796)', 15],
      ];

      const geojsonFeatures = [
        {
          type: 'Feature',
          id: 1,
          properties: {
            id: 1,
            name: 'Central Park',
            type: 'Park',
            city: 'New York',
            size: 100,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-73.968285, 40.785091],
                [-73.968285, 40.764891],
                [-73.949318, 40.764891],
                [-73.949318, 40.785091],
                [-73.968285, 40.785091],
              ],
            ],
          },
        },
        {
          type: 'Feature',
          id: 2,
          properties: {
            id: 2,
            name: 'Empire State Building',
            type: 'Building',
            size: 200,
          },
          geometry: {
            type: 'Point',
            coordinates: [-73.985428, 40.748817],
          },
        },
        {
          type: 'Feature',
          id: 3,
          properties: {
            id: 3,
            name: 'Broadway',
            type: 'Road',
            size: 300,
          },
          geometry: {
            type: 'LineString',
            coordinates: [
              [-73.987381, 40.758896],
              [-73.98603, 40.757355],
              [-73.984442, 40.755823],
              [-73.98294, 40.754274],
            ],
          },
        },
      ];

      /**
       * @description WKT: Test style.icon_scaling
       * @function it
       */
      codi.it(
        {
          name: 'WKT: Test style.icon_scaling',
          parentId: 'layer_feature_formats',
        },
        () => {
          mapp.layer.featureFormats[layer.format](layer, wktFeatures);

          codi.assertEqual(
            layer.style.icon_scaling.max,
            15,
            'The Icon scaling max should equal to 15',
          );
        },
      );

      /**
       * @description WKT: featureFormats test
       * @function it
       */
      codi.it(
        { name: 'WKT: featureFormats test', parentId: 'layer_feature_formats' },
        () => {
          const assertIDArray = [1, 2, 3];
          const assertSizeArray = [null, 10, 15];
          const features = mapp.layer.featureFormats[layer.format](
            layer,
            wktFeatures,
          );

          //Check id's and size values are correct
          features.forEach((feature, index) => {
            codi.assertEqual(feature.values_.id, assertIDArray[index]);
            codi.assertEqual(feature.values_.size, assertSizeArray[index]);
          });
        },
      );

      /**
       * @description geojson: featureFormats test
       * @function it
       */
      codi.it(
        {
          name: 'geojson: featureFormats test',
          parentId: 'layer_feature_formats',
        },
        () => {
          layer.format = 'geojson';

          const assertIDArray = [1, 2, 3];
          const assertSizeArray = [100, 200, 300];
          const features = mapp.layer.featureFormats[layer.format](
            layer,
            geojsonFeatures,
          );

          //Check id's and size values are correct
          features.forEach((feature, index) => {
            codi.assertEqual(feature.values_.id, assertIDArray[index]);
            codi.assertEqual(feature.values_.size, assertSizeArray[index]);
          });
        },
      );
    },
  );
}
