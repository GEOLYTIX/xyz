const mergeDeep = require('../../mod/utils/merge');

describe('mergeDeep', () => {
    test('should merge objects deeply', () => {
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

        expect(mergedObj).toEqual(expected);
    });

    test('should merge arrays deeply', () => {
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

        expect(mergedObj).toEqual(expected);
    });

    test('should handle merging with null or undefined values', () => {
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

        expect(mergedObj1).toEqual(expected);
        expect(mergedObj2).toEqual(expected);
    });
});
