
/**
 * This test is used to see if all the language options at least have all of these base entries.
 * @function baseDictionaryTest
 */
export async function baseDictionaryTest() {
    codi.describe('All languages should have the same base language entries', () => {
        const base_dictionary = {
            save: '',
            cancel: '',
            confirm_delete: '',
            invalid_geometry: '',
            no_results: '',
        }

        Object.keys(mapp.dictionaries).forEach(language => {
            codi.it(`${language} dictionary should have all the base keys`, () => {
                Object.keys(base_dictionary).forEach(key => {
                    codi.assertTrue(!!mapp.dictionaries[language][key], `${language} should have ${key}`);
                });
            });
        });
    });
}