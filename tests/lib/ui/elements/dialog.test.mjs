
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
            contained: true
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
                const dialog_element = document.querySelector('[data-id="dialog-test"]')
                codi.assertEqual(dialog_element, null, 'The dialog should be removed from the DOM on close');
            });

            /**
             * The dialog should be able to be shown again
             * @function it
             */
            codi.it('Dialog should be able to be shown again', () => {
                dialog.show();
                const dialog_element = document.querySelector('[data-id="dialog-test"]')
                codi.assertEqual(dialog_element, dialog.node, 'The dialog should be in the DOM again');
            });

            dialog.close();
        });

        /**
         * Created dialog should not have a show method
         * @function it
         */
        codi.it('Should create a basic dialog without a show method', () => {

            params.new = true;
            const dialog = mapp.ui.elements.dialog({ ...params });

            codi.assertEqual(typeof dialog.show, 'undefined', 'The dialog show method should not be available');

            dialog.close()
        });
    });
}