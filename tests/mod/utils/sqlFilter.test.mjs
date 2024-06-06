import { describe, it, assertEqual } from 'codi-test-framework';
import sqlfilter from '../../../mod/utils/sqlFilter';

describe('sqlFilter', () => {

  it('should return correct string for eq filter', () => {

    const params = ['param1', 'param2'];

    const filter = {
      fieldname: {
        eq: 'value1'
      }
    };

    const expected = '("fieldname" = $3)';

    assertEqual(sqlfilter(filter, params), expected)

  });

  it('should return correct string for multiple filters', () => {

    const params = ['param1', 'param2'];

    const filter = {
      fieldname_a: {
        eq: 'value1'
      },
      fieldname_b: {
        gt: 'value2'
      }
    };

    const expected = '("fieldname_a" = $3 AND "fieldname_b" > $4)';

    assertEqual(sqlfilter(filter, params), expected)
  });

  it('should return correct string for multiple filters in array', () => {

    const params = ['param1', 'param2'];

    const filter = [
      {
        fieldname_a: {
          eq: 'value1'
        }
      },
      {
        fieldname_b: {
          gt: 'value2'
        }
      }
    ];

    const expected = '(("fieldname_a" = $3) OR ("fieldname_b" > $4))';

    assertEqual(sqlfilter(filter, params), expected)

  });

  it('should return undefined for invalid field name', () => {

    const params = ['param1', 'param2'];

    const filter = {
      'invalid-field-name!!!': {
        eq: 'value1'
      }
    };

    assertEqual(sqlfilter(filter, params), undefined);
  });
});