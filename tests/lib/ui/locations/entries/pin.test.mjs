import { mockLocation } from '../../../../utils/location.js';
/**
 * ## locations.entries.pinTest()
 * @module ui/elements/pinTest
 */
/**
 * This test is used to test the creation of the pin ui element.
 * @function pinTest 
*/
export async function pinTest(mapview) {
    await codi.describe('UI elements: pin', async () => {
        await codi.it('Needs to be able to create a pin element with a scale of 4', async () => {

            //Set the one pin style to have a scale of 4
            mapview.layers['location_get_test'].infoj.find(entry => entry.type === 'pin').style ??= { icon: { scale: 4 } };

            //Mock the location
            const location = await mockLocation(mapview);

            //Get the pinEntry from the location
            const pinEntry = location.infoj.filter(entry => entry.type === 'pin')[0];

            codi.assertTrue(!!pinEntry.style, 'The pinEntry needs to have a style object');
            codi.assertTrue(!!pinEntry.style.icon, 'The pinEntry needs to have an icon assigned to the style');
            codi.assertEqual(pinEntry.style.icon.scale, 4, 'The pinEntry needs to have an scale property on the icon set to 4');

            //remove the location
            location.removeCallbacks.push(_this => delete _this.removeCallbacks);
            location.remove();
        });
    });
}