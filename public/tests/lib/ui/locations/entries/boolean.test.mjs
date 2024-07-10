import { it, assertEqual } from 'https://esm.sh/codi-test-framework@0.0.26';
export async function booleanTest() {
    it('Should return a checkbox', () => {
        const entry = { title: 'title', field: 'booleanField', inline: true, value: false };
        const checkboxElement = mapp.ui.locations.entries.boolean(entry);

        assertEqual(checkboxElement.className, 'link-with-img', 'The Checkbox element should have a class of link-with-img');
        assertEqual(checkboxElement.children[0].className, 'mask-icon close', 'The checbox should have a first child with a close class');
    });
}