/**
 * This test is used to see if all the language options have the same keys as the English language.
 * English is the base language, so we check that all other languages have the same keys as English.
 * @function baseDictionaryTest
 */
export function baseDictionaryTest() {
  codi.describe(
    {
      name: 'All languages should have the keys as English',
      id: 'dictionary_base',
      parentId: 'dictionary',
    },
    () => {
      // English is the base, so we check that all other languages have the same keys as English.
      for (const language of Object.keys(mapp.dictionaries)) {
        // If the language is English, we skip it.
        if (language === 'en') {
          continue;
        }

        // Ensure that there are no keys that the english language doesn't have
        codi.it(
          {
            name: `${language} dictionary should have the same keys as English`,
            parentId: 'dictionary_base',
          },
          () => {
            for (const key of Object.keys(mapp.dictionaries[language])) {
              codi.assertTrue(
                Object.hasOwn(mapp.dictionaries['en'], key),
                `${language} has ${key} the base english`,
              );
            }
          },
        );
      }
    },
  );
}
