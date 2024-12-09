/**
 * This function is used as an entry point for the infoj test
 * @function injojTest
 */
export function infojTest() {
  codi.describe('UI Locations: infojTest', () => {
    /**
     * ### It should create an infoj with a correct order
     * 1. We define an infoj with a combination of different entries with keys, fields and queries
     * 2. We assert against the order when calling the infoj method
     * 3. We assert against the order when calling the infoj method with a different order as defined in the layer
     * @function it
     */
    codi.it('It should create an infoj with certain order as specified directly to the method', () => {

      const location = {
        infoj: [
          {
            field: 'field_1',
            key: 'key_1',
            label: 'test_1',
            value: 'test 1 value'
          },
          {
            field: 'field_2',
            label: 'test_2',
            value: 'value_2'
          },
          {
            field: 'field_3',
            label: 'test_3',
            value: 'value_3'
          },
          {
            key: 'key_4',
            value: 'value_4'
          },
          {
            query: 'query_5',
            value: 'value_5',
            location: {}
          }
        ]
      };

      const infoj_order = [
        '_field_1',
        'field_2',
        'field_3',
        'key_4',
        'query_5',
        {
          field: 'field6',
          value: 'value_6'
        }
      ];

      // Get listview element from the infoj object
      const infoj = mapp.ui.locations.infoj(location, infoj_order);

      // Get textvalues from location listview elements.
      const results = Array.from(infoj.children)
        .map(el => el.firstChild.innerText.trim())

      // Expected results
      const expected = [
        'value_2',
        'value_3',
        'value_4',
        'value_5',
        'value_6'
      ];

      // Asserting we get the expected results and order
      codi.assertEqual(results, expected, 'The infoj order needs to be as defined in the expected');

    });

    codi.it('It should create an infoj with certain order as defined on the layer', () => {

      const location = {
        infoj: [
          {
            field: 'field_1',
            key: 'key_1',
            label: 'test_1',
            value: 'test 1 value'
          },
          {
            field: 'field_2',
            label: 'test_2',
            value: 'value_2'
          },
          {
            field: 'field_3',
            label: 'test_3',
            value: 'value_3'
          },
          {
            key: 'key_4',
            value: 'value_4'
          },
          {
            query: 'query_5',
            value: 'value_5',
            location: {}
          }
        ]
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
          value: 'value_6'
        }
      ];

      // Get listview element from the infoj object
      const infoj = mapp.ui.locations.infoj(location);

      // Get textvalues from location listview elements.
      const results = Array.from(infoj.children)
        .map(el => el.firstChild.innerText.trim())

      // Expected results
      const expected = [
        'value_2',
        'value_3',
        'value_4',
        'value_5',
        'value_6'
      ];

      // Asserting we get the expected results and order
      codi.assertEqual(results, expected, 'The infoj order needs to be as defined in the expected');

    });
  });
}
