/**
 * ## layer.changeEndTest()
 * @module ui/elements/pills
 */


/**
 * This is the entry function for the pills test.
 * @function pillsTest
 */
export async function pillsTest() {
    await codi.describe('UI Elements: Pills', async () => {
        //creating the pills component without any params
        const pillsComponent = mapp.ui.elements.pills();

        /**
         * We should be able to create a pills component with 0 params
         * We check if there is an add/remove function on the returned componenent.
         * We also check if we have a pills set
         * @fucntion it
         */
        await codi.it('Should create pills', () => {
            codi.assertTrue(typeof pillsComponent.add === 'function', 'The pills needs to have an add function');
            codi.assertTrue(typeof pillsComponent.remove === 'function', 'The pills needs to have an add function');
            codi.assertTrue(typeof pillsComponent.pills === 'object', 'The pills needs to have a pills object');
        });

        /**
         * Testing if we can add pills with the add function.
         * @function it
         */
        await codi.it('We should be able to add pills', () => {
            pillsComponent.add('pill');
            codi.assertTrue(pillsComponent.pills.size === 1, 'We should have 1 pill in the pills set');
        });

        /**
         * Testing if we can remove a pill with the remove function.
         * @function it 
         */
        await codi.it('We should be able to remove pills', () => {
            pillsComponent.remove('pill');
            codi.assertTrue(pillsComponent.pills.size === 0, 'We should have 1 pill in the pills set');
        });

    });
}
