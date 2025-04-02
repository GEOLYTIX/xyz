import { setView } from '../../utils/view.js';
export async function fadeTest(mapview) {
  await setView(mapview, 2, 'default');
  await codi.describe('TODO: Layer: fadeTest', async () => {
    await codi.it('Should should test for something', () => {
      console.warn('The Fade module needs to be re-reviewed.');
    });
  });
}
