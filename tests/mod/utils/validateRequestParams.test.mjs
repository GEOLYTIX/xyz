import { describe, it, assertEqual, assertThrows } from 'codi-test-framework';
import params from '../../../mod/utils/validateRequestParams';

describe('validateParams Module', () => {
    test('should return true when all params are valid', () => {
        const parameters = {
            param1: 'abc',
            param2: '123',
            param3: 'test,123',
            filter: 'test'
        };

        const result = params(parameters);
        assertEqual(result, true);
    });

    test('should return false when a param is invalid', () => {
        const parameters = {
            param1: 'abc',
            param2: 'inval!d',
            param3: 'test,123',
            filter: 'test'
        };

        const result = params(parameters);

        assertEqual(result, false);
    });

    test('should return true when all params are objects', () => {
        const parameters = {
            param1: { prop: 'value' },
            param2: { nested: { prop: 'value' } },
            filter: 'test'
        };

        const result = params(parameters);

        assertEqual(result, true);
    });

    test('should return true when no params are provided', () => {
        const parameters = {
            filter: 'test'
        };

        const result = params(parameters);
        assertEqual(result, true);
    });
});
