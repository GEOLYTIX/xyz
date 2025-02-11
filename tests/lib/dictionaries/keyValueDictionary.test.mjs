/**
 * @description This test is used to see if the key value dictionary is working correctly
 * @function keyValueDictionaryTest
 */
export async function keyValueDictionaryTest(mapview) {
  await codi.describe('Key Value Dictionary Tests', async () => {
    await codi.it(
      'should replace the key value dictionary for default value on a layer',
      () => {
        // Get the OSM layer from the mapview
        const osm = mapview.locale.layers.find((layer) => layer.key === 'OSM');
        // Check the OSM layer has the correct name
        codi.assertEqual(osm.name, 'OpenStreetMap KeyValue Dictionary');
      },
    );

    await codi.it(
      'should replace the key value dictionary for default value in an infoj',
      () => {
        // Get the changeEnd layer from the mapview
        const changeEnd = mapview.locale.layers.find(
          (layer) => layer.key === 'changeEnd',
        );
        // Check the changeEnd infoj entry of field textarea has the correct title
        const entry = changeEnd.infoj.find(
          (entry) => entry.field === 'textarea',
        );
        // Check the changeEnd infoj entry of field textarea has the correct title
        codi.assertEqual(entry.title, 'TextArea KeyValue Dictionary');
      },
    );

    await codi.it(
      'should not replace the key value dictionary for an array',
      () => {
        // Get the changeEnd layer from the mapview
        const changeEnd = mapview.locale.layers.find(
          (layer) => layer.key === 'changeEnd',
        );
        // Check the changeEnd test_array has the correct value
        const array = changeEnd.test_array;
        const expected = ['TEST KEYVALUE'];

        // Check the changeEnd infoj entry of field textarea has the correct array value
        codi.assertEqual(array, expected);
      },
    );
  });
}
