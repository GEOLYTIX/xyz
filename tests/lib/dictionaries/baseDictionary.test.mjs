/**
 * This test is used to see if all the language options at least have all of these base entries.
 * @function baseDictionaryTest
 */
export async function baseDictionaryTest() {
  await codi.describe(
    'All languages should have the same base language entries',
    async () => {
      const base_dictionary = {
        save: '',
        cancel: '',
        confirm_delete: '',
        invalid_geometry: '',
        no_results: '',
      };

      for (const language of Object.keys(mapp.dictionaries)) {
        await codi.it(
          `${language} dictionary should have all the base keys`,
          () => {
            for (const key of Object.keys(base_dictionary)) {
              codi.assertTrue(
                !!mapp.dictionaries[language][key],
                `${language} should have ${key}`,
              );
            }
          },
        );
      }
    },
  );
}
