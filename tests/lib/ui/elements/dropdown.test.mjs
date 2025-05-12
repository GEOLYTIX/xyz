export function dropdown() {
  codi.describe({ id: 'ui_elements_dropdown', name: 'Dropdown:' }, () => {
    codi.it(
      { name: 'Dropdown basic test', parentId: 'ui_elements_dropdown' },
      () => {
        const params = {
          entries: [
            {
              field: 'ting_field_1',
              label: 'ting_1',
              option: 'ting_1',
              selected: true,
            },
            {
              field: 'ting_field_2',
              label: 'ting_2',
              option: 'ting_2',
              selected: false,
            },
            {
              field: 'ting_field_3',
              label: 'ting_3',
              option: 'ting_3',
              selected: false,
            },
          ],
        };

        const node = mapp.ui.elements.dropdown(params);

        const head = node.querySelector('div.head');

        const list = node.querySelector('ul');

        const items = node.querySelectorAll('li');

        codi.assertTrue(node instanceof HTMLElement);
        codi.assertTrue(head !== null);
        codi.assertTrue(list !== null);
        codi.assertEqual(items.length, 3);
      },
    );
  });
}
