import { describe, it, assertDeepEqual } from 'codi-test-framework';
import mergeDeep from '../../../mod/utils/merge.js'

describe('mergeDeep', () => {

    it('should merge objects deeply', () => {
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
            hobbies: ['squash', 'guitar', 'cooking'],
        };

        const mergedObj = mergeDeep(target, source);

        assertDeepEqual(mergedObj, expected)
    });

    it('should merge arrays deeply', () => {
        const target = {
            fruits: ['apple', 'banana'],
        };

        const source = {
            fruits: ['banana', 'orange'],
        };

        const expected = {
            fruits: ['apple', 'banana','banana', 'orange'],
        };

        const mergedObj = mergeDeep(target, source);

        assertDeepEqual(mergedObj, expected)
    });

    it('should handle merging with null or undefined values', () => {
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

        const mergedObj1 = mergeDeep(target, source1);
        const mergedObj2 = mergeDeep(target, source2);

        assertDeepEqual(mergedObj1, expected);
        assertDeepEqual(mergedObj2, expected);
    });

});
