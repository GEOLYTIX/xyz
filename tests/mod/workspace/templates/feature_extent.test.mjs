import feature_extent from '../../../../mod/workspace/templates/feature_extent.js';

export function featureExtentTests() {
  codi.describe(
    {
      name: 'feature_extent',
      id: 'template_feature_extent',
      parentId: 'template',
    },
    () => {
      codi.it(
        {
          name: 'Should generate correct SQL for valid input',
          parentId: 'template_feature_extent',
        },
        () => {
          const req = {
            body: {
              ids: ['123', '456', '789'],
            },
            geom: 'geom',
            srid: 4326,
            proj: 3857,
            table: 'public.features',
          };

          const result = feature_extent(req);

          // Build expected SQL with direct property substitution
          const expected =
            "\n  SELECT\n    Box2D(ST_Transform(ST_SetSRID(ST_Extent(geom),4326), 3857))\n  FROM public.features\n  WHERE ${qID} IN ('123','456','789') ${filter}";

          codi.assertEqual(result, expected);
        },
      );

      codi.it(
        {
          name: 'Should filter out SQL injection attempts',
          parentId: 'template_feature_extent',
        },
        () => {
          const req = {
            body: {
              ids: [
                '123',
                '456; DROP TABLE users; --',
                '789',
                "'; DELETE FROM features; --",
                'valid_id',
              ],
            },
            geom: 'geom',
            srid: 4326,
            proj: 3857,
            table: 'public.features',
          };

          const result = feature_extent(req);

          // Should filter out malicious SQL and only include valid IDs
          const expected =
            "\n  SELECT\n    Box2D(ST_Transform(ST_SetSRID(ST_Extent(geom),4326), 3857))\n  FROM public.features\n  WHERE ${qID} IN ('123','789','valid_id') ${filter}";

          codi.assertEqual(result, expected);
        },
      );

      codi.it(
        {
          name: 'Should handle empty ids array',
          parentId: 'template_feature_extent',
        },
        () => {
          const req = {
            body: {
              ids: [],
            },
            geom: 'geom',
            srid: 4326,
            proj: 3857,
            table: 'public.features',
          };

          const result = feature_extent(req);

          const expected =
            "\n  SELECT\n    Box2D(ST_Transform(ST_SetSRID(ST_Extent(geom),4326), 3857))\n  FROM public.features\n  WHERE ${qID} IN ('') ${filter}";

          codi.assertEqual(result, expected);
        },
      );

      codi.it(
        {
          name: 'Should handle single valid ID',
          parentId: 'template_feature_extent',
        },
        () => {
          const req = {
            body: {
              ids: ['single_id'],
            },
            geom: 'geom',
            srid: 4326,
            proj: 3857,
            table: 'public.features',
          };

          const result = feature_extent(req);

          const expected =
            "\n  SELECT\n    Box2D(ST_Transform(ST_SetSRID(ST_Extent(geom),4326), 3857))\n  FROM public.features\n  WHERE ${qID} IN ('single_id') ${filter}";

          codi.assertEqual(result, expected);
        },
      );

      codi.it(
        {
          name: 'Should handle IDs with allowed special characters',
          parentId: 'template_feature_extent',
        },
        () => {
          const req = {
            body: {
              ids: [
                'id_with_underscore',
                'id-with-dash',
                'id.with.dot',
                'id with space',
                'ID_WITH_UPPERCASE',
                'id123',
                'id,with,comma',
              ],
            },
            geom: 'geom',
            srid: 4326,
            proj: 3857,
            table: 'public.features',
          };

          const result = feature_extent(req);

          const expected =
            "\n  SELECT\n    Box2D(ST_Transform(ST_SetSRID(ST_Extent(geom),4326), 3857))\n  FROM public.features\n  WHERE ${qID} IN ('id_with_underscore','id-with-dash','id.with.dot','id with space','ID_WITH_UPPERCASE','id123','id,with,comma') ${filter}";

          codi.assertEqual(result, expected);
        },
      );

      codi.it(
        {
          name: 'Should filter out IDs with dangerous characters',
          parentId: 'template_feature_extent',
        },
        () => {
          const req = {
            body: {
              ids: [
                'valid_id',
                'id_with_semicolon;',
                'id_with_parens()',
                'id_with_brackets[]',
                'id_with_braces{}',
                'id_with_pipe|',
                'id_with_ampersand&',
                'dangerous; DROP TABLE test; --',
              ],
            },
            geom: 'geom',
            srid: 4326,
            proj: 3857,
            table: 'public.features',
          };

          const result = feature_extent(req);

          // Should only include the valid_id
          const expected =
            "\n  SELECT\n    Box2D(ST_Transform(ST_SetSRID(ST_Extent(geom),4326), 3857))\n  FROM public.features\n  WHERE ${qID} IN ('valid_id') ${filter}";

          codi.assertEqual(result, expected);
        },
      );

      codi.it(
        {
          name: 'Should handle different SRID and projection values',
          parentId: 'template_feature_extent',
        },
        () => {
          const req = {
            body: {
              ids: ['test_id'],
            },
            geom: 'geometry_column',
            srid: 27700,
            proj: 4326,
            table: 'test_table',
          };

          const result = feature_extent(req);

          const expected =
            "\n  SELECT\n    Box2D(ST_Transform(ST_SetSRID(ST_Extent(geometry_column),27700), 4326))\n  FROM test_table\n  WHERE ${qID} IN ('test_id') ${filter}";

          codi.assertEqual(result, expected);
        },
      );

      codi.it(
        {
          name: 'Should throw error for missing body.ids',
          parentId: 'template_feature_extent',
        },
        () => {
          const req = {
            body: {},
            geom: 'geom',
            srid: 4326,
            proj: 3857,
            table: 'public.features',
          };

          try {
            feature_extent(req);
            codi.assertEqual(false, true, 'Expected error to be thrown');
          } catch (error) {
            codi.assertEqual(
              error.message,
              'Invalid or missing body.ids - must be an array',
            );
          }
        },
      );

      codi.it(
        {
          name: 'Should throw error for non-array body.ids',
          parentId: 'template_feature_extent',
        },
        () => {
          const req = {
            body: {
              ids: 'not_an_array',
            },
            geom: 'geom',
            srid: 4326,
            proj: 3857,
            table: 'public.features',
          };

          try {
            feature_extent(req);
            codi.assertEqual(false, true, 'Expected error to be thrown');
          } catch (error) {
            codi.assertEqual(
              error.message,
              'Invalid or missing body.ids - must be an array',
            );
          }
        },
      );
    },
  );
}
