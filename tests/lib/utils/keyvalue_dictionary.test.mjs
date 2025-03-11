export function keyvalue_dictionary() {
  codi.describe(
    {
      name: 'Key Value Dictionary:',
      id: 'utils_keyvalue_dictionary',
      parentId: 'utils',
    },
    () => {
      codi.it(
        {
          name: 'object doesnt have keyvalue',
          parentId: 'utils_keyvalue_dictionary',
        },
        () => {
          const obj = {};

          mapp.utils.keyvalue_dictionary(obj);

          codi.assertEqual(obj, {}, 'We expect a blank object');
        },
      );

      codi.it(
        { name: 'object with keys', parentId: 'utils_keyvalue_dictionary' },
        () => {
          const obj = {
            keyvalue_dictionary: [
              {
                key: 'firstKey',
                value: 'OSM',
                default: 'OpenStreetMap',
                uk: 'Sława OpenStreetMap 🇺🇦',
              },
              {
                key: 'secondKey',
                value: 'OpenStreetMap',
                en: 'OpenStreetMap 🇬🇧',
              },
            ],
            layers: {
              layer1: {
                firstKey: 'OSM',
                secondKey: 'OpenStreetMap',
              },
            },
          };

          mapp.user = {
            language: 'uk',
          };

          mapp.utils.keyvalue_dictionary(obj);

          codi.assertEqual(
            obj.layers.layer1.firstKey,
            'Sława OpenStreetMap 🇺🇦',
            'We expect to see the Ukrainian translation',
          );

          codi.assertEqual(
            obj.layers.layer1.secondKey,
            'OpenStreetMap',
            'providing no default should result in the value remaining',
          );
        },
      );
    },
  );
}
