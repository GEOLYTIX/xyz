/**
 * @module utils/merge
 */

/**
 * This function is used to test the merge function
 * @function mergeTest
 */
export async function mergeTest() {

    await codi.describe('Utils: mergeTest Test', async () => {

        await codi.it('Hobbies should be overwritten in the merge', async () => {
            const target = {
                name: 'Rob',
                age: 28,
                address: {
                    street: '6 fourteenth street',
                    city: 'Johannesburg',
                },
                hobbies: ['squash', 'guitar'],
            };

            const source = {
                name: 'Rob',
                age: 28,
                address: {
                    street: '6 fourteenth street',
                    city: 'Johannesburg',
                },
                hobbies: ['cooking'],
            };

            const expected = {
                name: 'Rob',
                age: 28,
                address: {
                    street: '6 fourteenth street',
                    city: 'Johannesburg',
                },
                hobbies: ['cooking'],
            };

            const mergedObj = mapp.utils.merge(target, source);

            codi.assertEqual(mergedObj, expected)
        });

        await codi.it('should handle merging with null or undefined values', async () => {
            const target = {
                name: 'John',
                age: 30,
            };

            const source1 = null;
            const source2 = undefined;

            const expected = {
                name: 'John',
                age: 30,
            };

            const mergedObj1 = mapp.utils.merge(target, source1);
            const mergedObj2 = mapp.utils.merge(target, source2);

            codi.assertEqual(mergedObj1, expected);
            codi.assertEqual(mergedObj2, expected);
        });

        await codi.it('should prevent _proto merging', async () => {
            const filter = {
                current: {
                    'country': {
                        'in': ['ROI']
                    }
                }
            };
           
            const filter2 = {
                current: {
                    'country': {
                        'in': ['UK']
                    }
                }, 
                __proto__: {
                    'polluted': 'polluted'
                }
            };

            const expected = {
                current: {
                    'country': {
                        'in': ['UK']
                    }
                }
            };
            
            const mergedObj1 = mapp.utils.merge(filter, filter2);
            codi.assertEqual(mergedObj1, expected);
        });

    });
}