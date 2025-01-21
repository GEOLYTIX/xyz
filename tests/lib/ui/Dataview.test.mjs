import { mockLocation } from '../../utils/location.js';
/**
 * ## lib.ui.Dataview
 * @module ui/Dataview
 */
/**
 * This function is used to test the Dataview method
 * @function DataviewTest
 */
export async function DataviewTest(mapview) {
  await codi.describe('UI: Dataview', async () => {
    // Get the mocked location
    const location = await mockLocation(mapview);
    // Get the entry of type dataview
    const entry = location.infoj.find((entry) => entry.type === 'dataview');

    await codi.it('dataview should have a show method', async () => {
      codi.assertTrue(
        entry.show instanceof Function,
        'The dataview entry has a show method.',
      );
    });

    await codi.it(
      'dataview btnRow should be display none initially',
      async () => {
        codi.assertEqual(
          entry.btnRow.style.display,
          'none',
          'The dataview entry btnRow should be display none.',
        );
      },
    );

    await codi.it('dataview should have a hide method', async () => {
      codi.assertTrue(
        entry.hide instanceof Function,
        'The dataview entry has a hide method.',
      );
    });

    await codi.it(
      'dataview btnRow should be display true when show method called',
      async () => {
        entry.show();
        codi.assertEqual(
          entry.btnRow.style.display,
          'flex',
          'The dataview entry btnRow should be display flex.',
        );
      },
    );

    await codi.it(
      'dataview btnRow should be display none when hide method called',
      async () => {
        entry.hide();
        codi.assertEqual(
          entry.btnRow.style.display,
          'none',
          'The dataview entry btnRow should be display none.',
        );
      },
    );

    // Remove the mocked location
    location.remove();
  });
}
