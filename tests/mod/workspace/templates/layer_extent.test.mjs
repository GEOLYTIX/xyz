import layer_extent from '../../../../mod/workspace/templates/layer_extent.js';

export function layerExtentTests() {
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

          const result = layer_extent(req);

          // Build expected SQL with direct property substitution
          const expected =
            "\n    SELECT\n      ARRAY[\n        st_xmin(box.box2d),\n        st_ymin(box.box2d),\n        st_xmax(box.box2d),\n        st_ymax(box.box2d)]\n    FROM(\n      SELECT Box2D(\n        ST_Transform(\n          ST_SetSRID(\n            ST_Extent(${geom}),\n            ${proj}),\n          ${srid}))\n      FROM ${table}\n      WHERE ${qID} IN ('123','456','789') ${filter}) box";

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

          const result = layer_extent(req);

          // Should filter out malicious SQL and only include valid IDs
          const expected =
            "\n    SELECT\n      ARRAY[\n        st_xmin(box.box2d),\n        st_ymin(box.box2d),\n        st_xmax(box.box2d),\n        st_ymax(box.box2d)]\n    FROM(\n      SELECT Box2D(\n        ST_Transform(\n          ST_SetSRID(\n            ST_Extent(${geom}),\n            ${proj}),\n          ${srid}))\n      FROM ${table}\n      WHERE ${qID} IN ('123','789','valid_id') ${filter}) box";

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

          const result = layer_extent(req);

          const expected =
            "\n    SELECT\n      ARRAY[\n        st_xmin(box.box2d),\n        st_ymin(box.box2d),\n        st_xmax(box.box2d),\n        st_ymax(box.box2d)]\n    FROM(\n      SELECT Box2D(\n        ST_Transform(\n          ST_SetSRID(\n            ST_Extent(${geom}),\n            ${proj}),\n          ${srid}))\n      FROM ${table}\n      WHERE ${qID} IN ('') ${filter}) box";

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

          const result = layer_extent(req);

          const expected =
            "\n    SELECT\n      ARRAY[\n        st_xmin(box.box2d),\n        st_ymin(box.box2d),\n        st_xmax(box.box2d),\n        st_ymax(box.box2d)]\n    FROM(\n      SELECT Box2D(\n        ST_Transform(\n          ST_SetSRID(\n            ST_Extent(${geom}),\n            ${proj}),\n          ${srid}))\n      FROM ${table}\n      WHERE ${qID} IN ('single_id') ${filter}) box";

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

          const result = layer_extent(req);

          const expected =
            "\n    SELECT\n      ARRAY[\n        st_xmin(box.box2d),\n        st_ymin(box.box2d),\n        st_xmax(box.box2d),\n        st_ymax(box.box2d)]\n    FROM(\n      SELECT Box2D(\n        ST_Transform(\n          ST_SetSRID(\n            ST_Extent(${geom}),\n            ${proj}),\n          ${srid}))\n      FROM ${table}\n      WHERE ${qID} IN ('id_with_underscore','id-with-dash','id.with.dot','id with space','ID_WITH_UPPERCASE','id123','id,with,comma') ${filter}) box";

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

          const result = layer_extent(req);

          // Should only include the valid_id
          const expected =
            "\n    SELECT\n      ARRAY[\n        st_xmin(box.box2d),\n        st_ymin(box.box2d),\n        st_xmax(box.box2d),\n        st_ymax(box.box2d)]\n    FROM(\n      SELECT Box2D(\n        ST_Transform(\n          ST_SetSRID(\n            ST_Extent(${geom}),\n            ${proj}),\n          ${srid}))\n      FROM ${table}\n      WHERE ${qID} IN ('valid_id') ${filter}) box";

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

          const result = layer_extent(req);

          const expected =
            "\n    SELECT\n      ARRAY[\n        st_xmin(box.box2d),\n        st_ymin(box.box2d),\n        st_xmax(box.box2d),\n        st_ymax(box.box2d)]\n    FROM(\n      SELECT Box2D(\n        ST_Transform(\n          ST_SetSRID(\n            ST_Extent(${geom}),\n            ${proj}),\n          ${srid}))\n      FROM ${table}\n      WHERE ${qID} IN ('test_id') ${filter}) box";

          codi.assertEqual(result, expected);
        },
      );
    },
  );
}
