import { it, assertEqual, assertTrue } from 'https://esm.sh/codi-test-framework@0.0.29';
export async function baseDictionaryTest() {
    it('All languages should have the same base language entries', () => {
        const base_dictionary = {
            save: '',
            cancel: '',
            confirm_delete: '',
            invalid_geometry: '',
            no_results: '',
        }

        Object.keys(mapp.dictionaries).forEach(language => {
            Object.keys(base_dictionary).forEach(key => {
                assertTrue(!!mapp.dictionaries[language][key], `${language} should have ${key}`);
                //console.log(mapp.dictionaries[language][key])
            });
        });
        //console.log(Object.keys(base_dictionary));

        // const entry = { title: 'title', field: 'booleanField', inline: true, value: false };
        // const checkboxElement = mapp.ui.locations.entries.boolean(entry);

        // assertEqual(checkboxElement.className, 'link-with-img', 'The Checkbox element should have a class of link-with-img');
        // assertEqual(checkboxElement.children[0].className, 'mask-icon close', 'The checbox should have a first child with a close class');
    });
}