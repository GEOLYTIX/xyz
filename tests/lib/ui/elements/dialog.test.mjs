
/**
 * This function is used to test the dialog ui element.
 * @function dialogTest
 */
export async function dialogTest() {
    await codi.describe('UI Elements: dialog/modal', async () => {

        const params = {
            target: document.getElementById('Map'),
            closeBtn: true,
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
        await codi.it('Should create a basic dialog', async () => {

            const dialog = mapp.ui.elements.dialog({...params});

            /**
             * The dialog should be able to close
             * @function it
             */
            await codi.it('Dialog should be able to close', async () => {
                dialog.close();
                const dialog_element = document.querySelector('#Map > dialog');
                codi.assertEqual(dialog_element, null, 'The dialog should be removed from the DOM on close');
            });

            /**
             * The dialog should be able to be shown again
             * @function it
             */
            await codi.it('Dialog should be able to be shown again', async () => {
                dialog.show();
                const dialog_element = document.querySelector('#Map > dialog');
                codi.assertEqual(dialog_element, dialog.node, 'The dialog should be in the DOM again');
            });

            dialog.close();
        });

        /**
         * Created dialog should not have a show method
         * @function it
         */
        await codi.it('Should create a basic dialog without a show method', async () => {

            params.new = true;
            const dialog = mapp.ui.elements.dialog({...params});
            
            codi.assertEqual(typeof dialog.show, 'undefined', 'The dialog show method should not be available');

            dialog.close()
        });
    });
}