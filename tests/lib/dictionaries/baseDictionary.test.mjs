
/**
 * This test is used to see if all the language options at least have all of these base entries.
 * @function baseDictionaryTest
 */
export function baseDictionaryTest() {
    codi.describe('All languages should have the same base language entries', () => {

        const base_dictionary = {
            save: '',
            cancel: '',
            confirm_delete: '',
            invalid_geometry: '',
            no_results: '',
        };

        for (const language of Object.keys(mapp.dictionaries)) {
            codi.it(`${language} dictionary should have all the base keys`, () => {
                for (const key of Object.keys(base_dictionary)) {
                    codi.assertTrue(!!mapp.dictionaries[language][key], `${language} should have ${key}`);
                }
            });
        }
    });
}