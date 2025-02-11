/**
 * ## layer.decorateTest()
 * @module ui/elements/confirm
 */
/**
 * This function is used to test the confirm method
 * @function confirmTest
 */
export async function confirmTest() {
  await codi.describe('UI elements: Confirm', async () => {
    // Test providing params
    await codi.describe(
      'Should create a confirm dialog with params provided',
      async () => {
        mapp.ui.elements.confirm({
          title: 'CONFIRM TITLE',
          text: 'CONFIRM TEXT',
          data_id: 'confirm-test',
        });

        // Get the confirm element

        const confirm = document.querySelector('[data-id=confirm-test]');
        codi.assertTrue(
          confirm !== undefined,
          'We expect to see the confirm element',
        );

        await codi.it('Should have a title of CONFIRM TITLE', async () => {
          // Get the confirm title
          const confirm_title = confirm.querySelector('h4').textContent;
          codi.assertEqual(
            confirm_title,
            'CONFIRM TITLE',
            'We expect to see the confirm title',
          );
        });

        await codi.it('Should have a text of CONFIRM TEXT', async () => {
          // Get the confirm text
          const confirm_text = confirm.querySelector('p').textContent;
          codi.assertEqual(
            confirm_text,
            'CONFIRM TEXT',
            'We expect to see the confirm text',
          );
        });

        // Get the confirm buttons
        const confirm_buttons = confirm.querySelectorAll('button');

        await codi.it('Should have an OK button', async () => {
          codi.assertEqual(
            confirm_buttons[0].innerText,
            'OK',
            'We expect to see the OK button',
          );
        });

        await codi.it('Should have a Cancel button', async () => {
          codi.assertEqual(
            confirm_buttons[1].innerText,
            'Cancel',
            'We expect to see the Cancel button',
          );
        });

        // Close the confirm
        confirm.remove();
      },
    );

    // Test providing no params
    await codi.describe(
      'Should create a confirm dialog with no params provided',
      async () => {
        mapp.ui.elements.confirm({ data_id: 'confirm-test' });

        // Get the confirm element
        const confirm = document.querySelector('[data-id=confirm-test]');
        codi.assertTrue(
          confirm !== undefined,
          'We expect to see the confirm element',
        );

        await codi.it('Should have a title of Information', async () => {
          // Get the confirm title
          const confirm_title = confirm.querySelector('h4').textContent;
          codi.assertEqual(
            confirm_title,
            'Confirm',
            'We expect to see the confirm title',
          );
        });

        await codi.it('Should have no text', async () => {
          // Get the confirm text
          const confirm_text = confirm.querySelector('p').textContent;
          codi.assertEqual(
            confirm_text,
            '',
            'We expect to see no confirm text',
          );
        });

        // Get the confirm buttons
        const confirm_buttons = confirm.querySelectorAll('button');

        await codi.it('Should have an OK button', async () => {
          codi.assertEqual(
            confirm_buttons[0].innerText,
            'OK',
            'We expect to see the OK button',
          );
        });

        await codi.it('Should have a Cancel button', async () => {
          codi.assertEqual(
            confirm_buttons[1].innerText,
            'Cancel',
            'We expect to see the Cancel button',
          );
        });

        // Close the confirm
        confirm.remove();
      },
    );
  });
}
