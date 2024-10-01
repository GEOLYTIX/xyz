import { describe, it, assertEqual } from 'codi-test-framework';
import sqlfilter from '../../../mod/utils/sqlFilter';

describe('sqlFilter', () => {

  it('should return correct string for eq filter', () => {
    // Pass one parameter
    const params = ['param1'];

    // 'value1' is passed as $2 in the query
    const filter = {
      fieldname: {
        eq: '100'
      }
    };

    const expected = '("fieldname" = $2)';

    assertEqual(sqlfilter(filter, params), expected)

  });

  it('should return correct string for gt filter', () => {

    // Pass one parameter
    const params = ['param1'];

    // 99 is passed as $2 in the query
    const filter = {
      fieldname: {
        gt: 99
      }
    };

    const expected = '("fieldname" > $2)';

    assertEqual(sqlfilter(filter, params), expected)

  });

  it('should return correct string for gte filter', () => {

    // Pass one parameter
    const params = ['param1'];

    // 99 is passed as $2 in the query
    const filter = {
      fieldname: {
        gte: 99
      }
    };

    const expected = '("fieldname" >= $2)';

    assertEqual(sqlfilter(filter, params), expected)

  });

  it('should return correct string for lt filter', () => {

    // Pass one parameter
    const params = ['param1'];

    // 99 is passed as $2 in the query
    const filter = {
      fieldname: {
        lt: 99
      }
    };

    const expected = '("fieldname" < $2)';

    assertEqual(sqlfilter(filter, params), expected)

  });

  it('should return correct string for lte filter', () => {

    // Pass one parameter
    const params = ['param1'];

    // 99 is passed as $2 in the query
    const filter = {
      fieldname: {
        lte: 99
      }
    };

    const expected = '("fieldname" <= $2)';

    assertEqual(sqlfilter(filter, params), expected)

  });

  it('should return correct string for boolean filter', () => {

    // Pass one parameter
    const params = ['param1'];

    // true is passed as $2 in the query
    const filter = {
      fieldname: {
        boolean: true
      }
    };

    const expected = '("fieldname" IS true)';

    assertEqual(sqlfilter(filter, params), expected)

  });

  it('should return correct string for null filter', () => {

    // Pass one parameter
    const params = ['param1'];

    // true is passed as $2 in the query
    const filter = {
      fieldname: {
        null: 'test'
      }
    };

    const expected = '("fieldname" IS  NULL)';

    assertEqual(sqlfilter(filter, params), expected)

  });

  it('should return correct string for ni filter', () => {

    // Pass one parameter
    const params = ['param1'];

    // true is passed as $2 in the query
    const filter = {
      fieldname: {
        ni: 'test'
      }
    };

    const expected = '(NOT "fieldname" = ANY ($2))';

    assertEqual(sqlfilter(filter, params), expected)

  });

  it('should return correct string for in filter', () => {

    // Pass one parameter
    const params = ['param1'];

    // true is passed as $2 in the query
    const filter = {
      fieldname: {
        in: 'test'
      }
    };

    const expected = '("fieldname" = ANY ($2))';

    assertEqual(sqlfilter(filter, params), expected)

  });

  it('should return correct string for like filter', () => {

    // Pass one parameter
    const params = ['param1'];

    // test is passed as $2 in the query
    const filter = {
      fieldname: {
        like: 'test'
      }
    };

    const expected = '(("fieldname" ILIKE $2))';

    assertEqual(sqlfilter(filter, params), expected)

  });

  it('should return correct string for match filter', () => {

    // Pass one parameter
    const params = ['param1'];

    // test is passed as $2 in the query
    const filter = {
      fieldname: {
        match: 'test'
      }
    };

    const expected = '("fieldname"::text = $2)';

    assertEqual(sqlfilter(filter, params), expected)

  });

  it('should return correct string for multiple filters', () => {

    const params = ['param1', 'param2'];

    const filter = {
      fieldname_a: {
        eq: '100'
      },
      fieldname_b: {
        gt: '200'
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
          eq: '100'
        }
      },
      {
        fieldname_b: {
          gt: 200
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