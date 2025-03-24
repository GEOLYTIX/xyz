/**
 * ## layer.changeEndTest()
 * @module ui/elements/pills
 */

/**
 * This is the entry function for the pills test.
 * @function pillsTest
 */
export function pills() {
  codi.describe(
    { name: 'Pills test:', id: 'ui_elements_pills', parentId: 'ui_elements' },
    () => {
      //creating the pills component without any params
      const pillsComponent = mapp.ui.elements.pills();

      /**
       * We should be able to create a pills component with 0 params
       * We check if there is an add/remove function on the returned componenent.
       * We also check if we have a pills set
       * @fucntion it
       */
      codi.it(
        { name: 'Should create pills', parentId: 'ui_elements_pills' },
        () => {
          codi.assertTrue(
            typeof pillsComponent.add === 'function',
            'The pills needs to have an add function',
          );
          codi.assertTrue(
            typeof pillsComponent.remove === 'function',
            'The pills needs to have an add function',
          );
          codi.assertTrue(
            typeof pillsComponent.pills === 'object',
            'The pills needs to have a pills object',
          );
        },
      );

      /**
       * Testing if we can add pills with the add function.
       * @function it
       */
      codi.it(
        {
          name: 'We should be able to add pills',
          parentId: 'ui_elements_pills',
        },
        () => {
          pillsComponent.add('pill');
          codi.assertTrue(
            pillsComponent.pills.size === 1,
            'We should have 1 pill in the pills set',
          );
        },
      );

      /**
       * Testing if we can remove a pill with the remove function.
       * @function it
       */
      codi.it(
        {
          name: 'We should be able to remove pills',
          parentId: 'ui_elements_pills',
        },
        () => {
          pillsComponent.remove('pill');
          codi.assertTrue(
            pillsComponent.pills.size === 0,
            'We should have 1 pill in the pills set',
          );
        },
      );
    },
  );
}
