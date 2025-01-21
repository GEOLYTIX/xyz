/**
 * @module lib/utility/compose
 */

/**
 * @description This is used as an entry point for the compose utility test
 * @function composeTest
 */
export function compose() {
  codi.describe(
    { name: 'Compose Test:', id: 'utils_compose', parentId: 'utils' },
    () => {
      /**
       * ### Should compose functions from left to right
       * @function it
       */
      codi.it(
        {
          name: 'Should compose functions from left to right',
          parentId: 'utils_compose',
        },
        () => {
          //Different functions to use
          const addOne = (x) => x + 1;
          const double = (x) => x * 2;
          const square = (x) => x * x;

          //Creating the compose chain
          const composed = mapp.utils.compose(addOne, double, square);

          codi.assertEqual(
            composed(3),
            64,
            'We expect this order of opperation when composing functions left to right : ((3 + 1) * 2)^2 = 64',
          );
        },
      );

      /**
       * ### Should work with a single function
       * @function it
       */
      codi.it(
        {
          name: 'Should work with a single function',
          parentId: 'utils_compose',
        },
        () => {
          const addTwo = (x) => x + 2;

          //Creating the compose chain
          const composed = mapp.utils.compose(addTwo);

          codi.assertEqual(
            composed(5),
            7,
            'Compose should also work with a single function',
          );
        },
      );

      /**
       * ### Should return the input if no functions are provided
       * @function it
       */
      codi.it(
        {
          name: 'Should return the input if no functions are provided',
          parentId: 'utils_compose',
        },
        () => {
          //Creating the compose chain
          const composed = mapp.utils.compose();

          codi.assertEqual(
            composed(10),
            10,
            'We should get the input as a return if no functions are provided',
          );
        },
      );

      /**
       * ### Should handle different data types
       * @function it
       */
      codi.it(
        {
          name: 'Should handle different data types',
          parentId: 'utils_compose',
        },
        () => {
          const toUpperCase = (str) => str.toUpperCase();
          const addExclamation = (str) => str + '!';
          const composed = mapp.utils.compose(addExclamation, toUpperCase);

          codi.assertEqual(
            composed('hello'),
            'HELLO!',
            'We expect the string to change in the chain given.',
          );
        },
      );
    },
  );
}
