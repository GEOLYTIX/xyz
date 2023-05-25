const sqlfilter = require('../../../mod/utils/sqlFilter');

describe('sqlfilter', () => {
  test('should generate a valid SQL filter string for single filter entry', () => {
    const filter = {
      field1: {
        eq: 10,
      },
    };

    const params = [];
    const result = sqlfilter(filter, params);

    expect(result).toBe('("field1" = $1)');
    expect(params).toEqual([ '10' ]);
  });

  test('should generate a valid SQL filter string for multiple filter entries', () => {
    const filter = {
      field1: {
        eq: 10,
      },
      field2: {
        lt: 5,
      },
    };

    const params = [];
    const result = sqlfilter(filter, params);

    expect(result).toBe('("field1" = $1 AND "field2" < $2)');
    expect(params).toEqual([ '10' ,  '5' ]);
  });

  test('should handle filter array with conditional OR', () => {
    const filter = [
      {
        field1: {
          eq: 10,
        },
      },
      {
        field2: {
          gt: 5,
        },
      },
    ];

    const params = [];
    const result = sqlfilter(filter, params);

    expect(result).toBe('(("field1" = $1) OR ("field2" > $2))');
    expect(params).toEqual([ '10', '5' ]);
  });

  test('should handle filter entries with multiple filter types', () => {
    const filter = {
      field1: {
        eq: 10,
        lt: 5,
      },
    };

    const params = [];
    const result = sqlfilter(filter, params);

    expect(result).toBe('("field1" = $1 AND "field1" < $2)');
    expect(params).toEqual(['10', '5']);
  });

  test('should ignore invalid field identifiers', () => {
    const filter = {
      'field1; DROP TABLE users': {
        eq: 10,
      },
      field2: {
        lt: 5,
      },
    };

    const params = [];
    const result = sqlfilter(filter, params);

    expect(result).toBe('("field2" < $1)');
    expect(params).toEqual(['5']);
  });
});