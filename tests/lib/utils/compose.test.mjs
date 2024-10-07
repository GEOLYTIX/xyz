/**
 * @module lib/utility/compose
 */

/**
 * @description This is used as an entry point for the compose utility test
 * @function composeTest 
 */
export function composeTest() {
    codi.describe('Compose Test', () => {

        /**
         * ### Should compose functions from left to right
         * @function it
         */
        codi.it('Should compose functions from left to right', () => {
            //Different functions to use
            const addOne = x => x + 1;
            const double = x => x * 2;
            const square = x => x * x;

            //Creating the compose chain
            const composed = mapp.utils.compose(addOne, double, square);

            codi.assertEqual(composed(3), 64, 'We expect this order of opperation when composing functions left to right : ((3 + 1) * 2)^2 = 64');
        });

        /**
         * ### Should work with a single function
         * @function it
         */
        codi.it('Should work with a single function', () => {
            const addTwo = x => x + 2;

            //Creating the compose chain
            const composed = mapp.utils.compose(addTwo);

            codi.assertEqual(composed(5), 7, 'Compose should also work with a single function');
        });

        /**
         * ### Should return the input if no functions are provided
         * @function it
         */
        codi.it('Should return the input if no functions are provided', () => {
            //Creating the compose chain
            const composed = mapp.utils.compose();

            codi.assertEqual(composed(10), 10, 'We should get the input as a return if no functions are provided');
        });

        /**
         * ### Should handle different data types
         * @function it
         */
        codi.it('Should handle different data types', () => {
            const toUpperCase = str => str.toUpperCase();
            const addExclamation = str => str + '!';
            const composed = mapp.utils.compose(addExclamation, toUpperCase);

            codi.assertEqual(composed('hello'), 'HELLO!', 'We expect the string to change in the chain given.');
        });


    });
}