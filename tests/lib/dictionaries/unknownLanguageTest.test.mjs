/**
 * This test is used to see if the mapp.language exists in the dictionaries object.
 * If not, it should return a warning and default to 'en'.
 * @function unknownLanguageTest
 */
export function unknownLanguageTest() {
    // Describe the test
    codi.describe('Language TEST should default language to English', () => {

        // The language was set to 'TEST' in _test.html, which is not a valid language

        // Assert that the language has been reset to 'en'
        codi.it('Should default to English', () => {
            codi.assertEqual(mapp.language, 'en');
        });
    });
}
