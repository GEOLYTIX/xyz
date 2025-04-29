/**
 * This function is used as an entry point for the infoj test
 * @function injojTest
 */
export function infoj() {
  codi.describe(
    { id: 'ui_locations_infoj', name: 'infoj test:', parentId: 'ui_locations' },
    () => {
      const originalConsole = console.warn;

      const mockWarns = [];

      console.warn = (message) => {
        mockWarns.push(message);
      };

      const originalXHR = mapp.utils.xhr;

      /**
       * ### It should create an infoj with a correct order
       * 1. We define an infoj with a combination of different entries with keys, fields and queries
       * 2. We assert against the order when calling the infoj method
       * 3. We assert against the order when calling the infoj method with a different order as defined in the layer
       * @function it
       */
      codi.it(
        {
          name: 'It should create an infoj with certain order',
          parentId: 'ui_locations_infoj',
        },
        () => {
          const location = {
            infoj: [
              {
                field: 'field_1',
                key: 'key_1',
                label: 'test_1',
                value: 'test 1 value',
              },
              {
                field: 'field_2',
                label: 'test_2',
                value: 'value_2',
              },
              {
                field: 'field_3',
                label: 'test_3',
                value: 'value_3',
              },
              {
                key: 'key_4',
                value: 'value_4',
              },
              {
                location: {},
                query: 'query_5',
                value: 'value_5',
              },
            ],
          };

          const infoj_order = [
            '_field_1',
            'field_2',
            'field_3',
            'key_4',
            'query_5',
            {
              field: 'field6',
              value: 'value_6',
            },
          ];

          // Get listview element from the infoj object
          const infoj = mapp.ui.locations.infoj(location, infoj_order);

          // Get textvalues from location listview elements.
          const results = Array.from(infoj.children).map((el) =>
            el.firstChild.innerText.trim(),
          );

          // Expected results
          const expected = [
            'value_2',
            'value_3',
            'value_4',
            'value_5',
            'value_6',
          ];

          // Asserting we get the expected results and order
          codi.assertEqual(
            results,
            expected,
            'The infoj order needs to be as defined in the expected',
          );
        },
      );

      codi.it(
        {
          name: 'It should create an infoj with certain order as defined on the layer',
          parentId: 'ui_locations_infoj',
        },
        () => {
          const location = {
            infoj: [
              {
                field: 'field_1',
                key: 'key_1',
                label: 'test_1',
                value: 'test 1 value',
              },
              {
                field: 'field_2',
                label: 'test_2',
                value: 'value_2',
              },
              {
                field: 'field_3',
                label: 'test_3',
                value: 'value_3',
              },
              {
                key: 'key_4',
                value: 'value_4',
              },
              {
                location: {},
                query: 'query_5',
                value: 'value_5',
              },
            ],
          };

          // Set the order on the layer
          location.layer = {};
          location.layer.infoj_order = [
            '_field_1',
            'field_2',
            'field_3',
            'key_4',
            'query_5',
            {
              field: 'field6',
              value: 'value_6',
            },
          ];

          // Get listview element from the infoj object
          const infoj = mapp.ui.locations.infoj(location);

          // Get textvalues from location listview elements.
          const results = Array.from(infoj.children).map((el) =>
            el.firstChild.innerText.trim(),
          );

          // Expected results
          const expected = [
            'value_2',
            'value_3',
            'value_4',
            'value_5',
            'value_6',
          ];

          // Asserting we get the expected results and order
          codi.assertEqual(
            results,
            expected,
            'The infoj order needs to be as defined in the expected',
          );
        },
      );

      codi.it(
        {
          name: 'Entry query method',
          parentId: 'ui_locations_infoj',
        },
        async () => {
          const location = {
            infoj: [
              {
                field: 'test_field',
                location: {},
                query: 'json_query',
                queryparams: {
                  id: true,
                  table: true,
                },
                runOnce: true,
                template: {
                  key: 'json_query',
                  template:
                    'SELECT ST_asGeoJSON(geom_3857) FROM ${table} WHERE glx_id = %{id}',
                  value_only: true,
                },
                type: 'text',
              },
            ],
          };

          mapp.utils.xhr = () => {
            return new Promise((resolve) => {
              resolve({ test_field: '1000' });
            });
          };

          // Set the order on the layer
          location.layer = {};
          location.layer.infoj_order = ['json_query'];

          // Get listview element from the infoj object
          const infoj = await mapp.ui.locations.infoj(location);

          // Get textvalues from location listview elements.
          const results = Array.from(infoj.children).map((el) =>
            el.firstChild.innerText.trim(),
          );

          codi.assertEqual(results[0], '1000', 'Ensure the entry runs');
        },
      );

      console.warn = originalConsole;
      mapp.utils.xhr = originalXHR;
    },
  );
}
