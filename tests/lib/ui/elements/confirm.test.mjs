/**
 * ## layer.decorateTest()
 * @module ui/elements/confirm
 */
/**
 * This function is used to test the confirm method
 * @function confirmTest
 */
export function confirm() {
  codi.describe(
    { name: 'Confirm:', id: 'ui_elements_confirm', parentId: 'ui_elements' },
    () => {
      // Test providing params
      codi.describe(
        {
          name: 'Should create a confirm dialog with params provided',
          id: 'ui_elements_confirm_with_params',
          parentId: 'ui_elements_confirm',
        },
        async () => {
          mapp.ui.elements.confirm({
            title: 'CONFIRM TITLE',
            text: 'CONFIRM TEXT',
            data_id: 'confirm-test',
          });

          // Get the confirm element

          const confirm = document.querySelector('[data-id=confirm-test]');

          codi.it(
            {
              name: 'We expect to see the confirm element',
              parentId: 'ui_elements_confirm_with_params',
            },
            () => {
              codi.assertTrue(
                confirm !== undefined,
                'We expect to see the confirm element',
              );
            },
          );

          codi.it(
            {
              name: 'Should have a title of CONFIRM TITLE',
              parentId: 'ui_elements_confirm_with_params',
            },
            () => {
              // Get the confirm title
              const confirm_title = confirm.querySelector('h4').textContent;
              codi.assertEqual(
                confirm_title,
                'CONFIRM TITLE',
                'We expect to see the confirm title',
              );
            },
          );

          codi.it(
            {
              name: 'Should have a text of CONFIRM TEXT',
              parentId: 'ui_elements_confirm_with_params',
            },
            () => {
              // Get the confirm text
              const confirm_text = confirm.querySelector('p').textContent;
              codi.assertEqual(
                confirm_text,
                'CONFIRM TEXT',
                'We expect to see the confirm text',
              );
            },
          );

          // Get the confirm buttons
          const confirm_buttons = confirm.querySelectorAll('button');

          codi.it(
            {
              name: 'Should have an OK button',
              parentId: 'ui_elements_confirm_with_params',
            },
            () => {
              codi.assertEqual(
                confirm_buttons[0].innerText,
                'OK',
                'We expect to see the OK button',
              );
            },
          );

          codi.it(
            {
              name: 'Should have a Cancel button',
              parentId: 'ui_elements_confirm_with_params',
            },
            () => {
              codi.assertEqual(
                confirm_buttons[1].innerText,
                'Cancel',
                'We expect to see the Cancel button',
              );
            },
          );

          // Close the confirm
          confirm.remove();
        },
      );

      // Test providing no params
      codi.describe(
        {
          name: 'Should create a confirm dialog with no params provided',
          id: 'ui_elements_confirm_no_params',
          parentId: 'ui_elements_confirm',
        },
        async () => {
          mapp.ui.elements.confirm({ data_id: 'confirm-test' });

          const confirm = document.querySelector('[data-id=confirm-test]');

          // Get the confirm element
          codi.it(
            {
              name: 'We expect to see the confirm element',
              parentId: 'ui_elements_confirm_no_params',
            },
            () => {
              codi.assertTrue(
                confirm !== undefined,
                'We expect to see the confirm element',
              );
            },
          );

          codi.it(
            {
              name: 'Should have a title of Information',
              parentId: 'ui_elements_confirm_no_params',
            },
            () => {
              // Get the confirm title
              const confirm_title = confirm.querySelector('h4').textContent;
              codi.assertEqual(
                confirm_title,
                'Confirm',
                'We expect to see the confirm title',
              );
            },
          );

          codi.it(
            {
              name: 'Should have no text',
              parentId: 'ui_elements_confirm_no_params',
            },
            () => {
              // Get the confirm text
              const confirm_text = confirm.querySelector('p').textContent;
              codi.assertEqual(
                confirm_text,
                '',
                'We expect to see no confirm text',
              );
            },
          );

          // Get the confirm buttons
          const confirm_buttons = confirm.querySelectorAll('button');

          codi.it(
            {
              name: 'Should have an OK button',
              parentId: 'ui_elements_confirm_no_params',
            },
            () => {
              codi.assertEqual(
                confirm_buttons[0].innerText,
                'OK',
                'We expect to see the OK button',
              );
            },
          );

          codi.it(
            {
              name: 'Should have a Cancel button',
              parentId: 'ui_elements_confirm_no_params',
            },
            () => {
              codi.assertEqual(
                confirm_buttons[1].innerText,
                'Cancel',
                'We expect to see the Cancel button',
              );
            },
          );

          // Close the confirm
          confirm.remove();
        },
      );
    },
  );
}
