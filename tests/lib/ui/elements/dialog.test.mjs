/**
 * This function is used to test the dialog ui element.
 * @function dialogTest
 */
export function dialogTest() {
  codi.describe('UI Elements: dialog/modal', () => {
    const params = {
      target: document.getElementById('Map'),
      closeBtn: true,
      data_id: 'dialog-test',
      headerDrag: true,
      header: 'I am a header',
      content: 'I am so content',
      top: '5em',
      left: '5em',
      contained: true,
    };

    /**
     * We should be able to create a basic dialog with some params
     * @function it
     */
    codi.it('Should create a basic dialog', () => {
      const dialog = mapp.ui.elements.dialog({ ...params });

      /**
       * The dialog should be able to close
       * @function it
       */
      codi.it('Dialog should be able to close', () => {
        dialog.close();
        const dialog_element = document.querySelector(
          '[data-id="dialog-test"]',
        );
        codi.assertEqual(
          dialog_element,
          null,
          'The dialog should be removed from the DOM on close',
        );
      });

      /**
       * The dialog should be able to be shown again
       * @function it
       */
      codi.it('Dialog should be able to be shown again', () => {
        dialog.show();
        const dialog_element = document.querySelector(
          '[data-id="dialog-test"]',
        );
        codi.assertEqual(
          dialog_element,
          dialog.node,
          'The dialog should be in the DOM again',
        );
      });

      dialog.close();
    });

    /**
     * Created dialog should not call show method
     * @function it
     */
    codi.it('Should recreate a basic dialog', () => {
      params.new = true;
      const new_params = { ...params };

      const dialog = mapp.ui.elements.dialog(new_params);
      dialog.close();

      const new_dialog = mapp.ui.elements.dialog(new_params);

      codi.assertEqual(dialog, new_dialog, 'The dialog should be recreated');

      new_dialog.close();
    });

    /**
     * Created dialog should have minimize/maximize functionality
     * @function it
     */
    codi.it('Should create a dialog that can minimize/maximize', () => {
      params.minimizeBtn = true;
      const new_params = { ...params };

      const dialog = mapp.ui.elements.dialog(new_params);

      dialog.node
        .querySelector('header > button.mask-icon.minimize-btn')
        .dispatchEvent(new Event('click'));
      let minimized = dialog.node.classList.contains('minimized');
      codi.assertTrue(minimized, 'The dialog content should not be visible');

      dialog.node
        .querySelector('header > button.mask-icon.minimize-btn')
        .dispatchEvent(new Event('click'));
      minimized = dialog.node.classList.contains('minimized');
      codi.assertFalse(minimized, 'The dialog content should not be visible');

      dialog.close();
    });
  });
}
