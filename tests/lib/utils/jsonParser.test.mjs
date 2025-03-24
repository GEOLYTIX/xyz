//json asset used for testing the jsonParser.
import jsonParserAsset from '../../assets/userLocale/jsonParser.json';
/**
 * This is the jsonParser entry test
 * @function jsonParser
 */
export function jsonParser() {
  codi.describe(
    { name: 'jsonParser Test:', id: 'utils_jsonParser', parentId: 'utils' },
    () => {
      const jsonObject = mapp.utils.jsonParser(jsonParserAsset);

      codi.it({ name: 'Check plugins', parentId: 'utils_jsonParser' }, () => {
        const plugins = jsonObject.locale.plugins;
        codi.assertTrue(
          Array.isArray(plugins),
          'We expect the plugins to be returned as an array',
        );
        codi.assertTrue(
          plugins.length === 3,
          'We expect the plugins to have a length of 3',
        );
      });

      codi.it({ name: 'Check keys', parentId: 'utils_jsonParser' }, () => {
        const expectedKeys = {
          falseKey: false,
          trueKey: true,
          nullKey: null,
        };

        Object.keys(expectedKeys).forEach((key) => {
          codi.assertEqual(
            jsonObject.locale[key],
            expectedKeys[key],
            'We expect the keys parsed to remain the same',
          );
        });
      });

      codi.it(
        { name: 'Check for nested arrays', parentId: 'utils_jsonParser' },
        () => {
          const lordArrArr = jsonObject.locale.lordArrArr;

          codi.assertTrue(
            Array.isArray(lordArrArr),
            'Ensure that we have an array',
          );
          codi.assertTrue(
            Array.isArray(lordArrArr[0][1]),
            'Ensure that we have a nested array',
          );
        },
      );

      codi.it(
        { name: 'Check stringyfied json', parentId: 'utils_jsonParser' },
        () => {
          const jsonParserAssetString = JSON.stringify(jsonParserAsset);
          const jsonObjectString = JSON.stringify(jsonObject);

          codi.assertEqual(
            jsonParserAssetString,
            jsonObjectString,
            'The test asset and object returned from the util function need to be equal stringified',
          );
        },
      );
    },
  );
}
