/**
 * @module utils/createExtent
 */

/**
 * This function is used as an entry point for the createExtent Test
 * @function createExtent
 */
export function createExtent() {
  codi.describe(
    { name: 'createExtent:', id: 'utils_createExtent', parentId: 'utils' },
    () => {
      const extents = [
        [
          -8938.312683973567, 6708675.727931868, -7938.312683973567,
          6709675.727931868,
        ],
        [
          -9109.921025660859, 6708976.010012405, -8035.783373665261,
          6709625.776244605,
        ],
      ];
      const fnExtents = [
        () => {
          return extents[0];
        },
        () => {
          return extents[1];
        },
      ];

      codi.it(
        {
          name: 'Should return an extent that contains all in extents array, from functions',
          parentId: 'utils_createExtent',
        },
        async () => {
          const overall_extent = await mapp.utils.createExtent(fnExtents);

          console.log(overall_extent);
          const contains =
            ol.extent.containsExtent(overall_extent, fnExtents[0]()) &&
            ol.extent.containsExtent(overall_extent, fnExtents[1]());

          codi.assertTrue(
            contains,
            'Expected the extent to contain the others, from functions',
          );
        },
      );

      codi.it(
        {
          name: 'Should return an extent that contains all in extents array.',
          parentId: 'utils_createExtent',
        },
        async () => {
          const overall_extent = await mapp.utils.createExtent(extents);

          const contains =
            ol.extent.containsExtent(overall_extent, extents[0]) &&
            ol.extent.containsExtent(overall_extent, extents[1]);

          codi.assertTrue(
            contains,
            'Expected the extent to contain the others',
          );
        },
      );

      codi.it(
        {
          name: 'Should return nothing if overall extent is invalid',
          parentId: 'utils_createExtent',
        },
        async () => {
          const overall_extent = await mapp.utils.createExtent([]);

          codi.assertEqual(
            overall_extent,
            null,
            'Expected null for invalid extents',
          );
        },
      );
    },
  );
}
