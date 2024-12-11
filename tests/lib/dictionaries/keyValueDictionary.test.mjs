/**
 * @description This test is used to see if the key value dictionary is working correctly
 * @function keyValueDictionaryTest
 */
export async function keyValueDictionaryTest(mapview) {
    codi.describe({ name: 'Key Value Dictionary Tests', id: 'key_value_dictionary' }, () => {

        codi.it({ name: 'should replace the key value dictionary for default value on a layer', parentId: 'key_value_dictionary' }, () => {
            // Get the OSM layer from the mapview
            const osm = mapview.locale.layers.find(layer => layer.key === 'OSM');
            // Check the OSM layer has the correct name
            codi.assertEqual(osm.name, 'OpenStreetMap KeyValue Dictionary');
        });

        codi.it({ name: 'should replace the key value dictionary for default value in an infoj', parentId: 'key_value_dictionary' }, () => {
            // Get the changeEnd layer from the mapview
            const changeEnd = mapview.locale.layers.find(layer => layer.key === 'changeEnd');
            // Check the changeEnd infoj entry of field textarea has the correct title
            const entry = changeEnd.infoj.find(entry => entry.field === 'textarea');
            // Check the changeEnd infoj entry of field textarea has the correct title
            codi.assertEqual(entry.title, 'TextArea KeyValue Dictionary');

        });

        codi.it({ name: 'should not replace the key value dictionary for an array', parentId: 'key_value_dictionary' }, () => {
            // Get the changeEnd layer from the mapview
            const changeEnd = mapview.locale.layers.find(layer => layer.key === 'changeEnd');
            // Check the changeEnd test_array has the correct value
            const array = changeEnd.test_array
            const expected = ['TEST KEYVALUE'];

            // Check the changeEnd infoj entry of field textarea has the correct array value
            codi.assertEqual(array, expected);
        });
    });
}
