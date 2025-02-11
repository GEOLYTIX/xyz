export async function olControlsTest(mapview) {
  await codi.describe('Mapview', async () => {
    await codi.it('The Mapview should have controls', () => {
      codi.assertTrue(
        mapview.controls.length >= 1,
        'The ol controls array should be greater or equal to 1',
      );
    });
  });
}
