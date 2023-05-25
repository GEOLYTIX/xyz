const validateParams = require('../../../mod/utils/validateRequestParams');

describe('validateParams', () => {
    test('should return true when all params are valid', () => {
        const params = {
            param1: 'abc',
            param2: '123',
            param3: 'test,123',
            filter: 'test'
        };

        const result = validateParams(params);

        expect(result).toBe(true);
    });

    test('should return false when a param is invalid', () => {
        const params = {
            param1: 'abc',
            param2: 'inval!d',
            param3: 'test,123',
            filter: 'test'
        };

        const result = validateParams(params);

        expect(result).toBe(false);
    });

    test('should return true when all params are objects', () => {
        const params = {
            param1: { prop: 'value' },
            param2: { nested: { prop: 'value' } },
            filter: 'test'
        };

        const result = validateParams(params);

        expect(result).toBe(true);
    });

    test('should return true when no params are provided', () => {
        const params = {
            filter: 'test'
        };

        const result = validateParams(params);

        expect(result).toBe(true);
    });
});
