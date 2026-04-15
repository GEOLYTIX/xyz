import sqlfilter from '@geolytix/xyz-app/mod/utils/sqlFilter.js';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const originalConsole = console.warn;
const mockWarns = [];

beforeAll(() => {
  console.warn = (log) => {
    mockWarns.push(log);
  };
});

afterAll(() => {
  console.warn = originalConsole;
});

describe('sqlFilter', () => {
  it('should return correct string for eq filter', () => {
    const SQLparams = ['param1'];

    const filter = {
      fieldname: {
        eq: '100',
      },
    };

    const expected = '("fieldname" = $2)';

    expect(sqlfilter(filter, { params: { SQL: SQLparams } })).toEqual(expected);
  });

  it('should return correct string for gt filter', () => {
    const SQLparams = ['param1'];

    const filter = {
      fieldname: {
        gt: 99,
      },
    };

    const expected = '("fieldname" > $2)';

    expect(sqlfilter(filter, { params: { SQL: SQLparams } })).toEqual(expected);
  });

  it('should return correct string for gte filter', () => {
    const SQLparams = ['param1'];

    const filter = {
      fieldname: {
        gte: 99,
      },
    };

    const expected = '("fieldname" >= $2)';

    expect(sqlfilter(filter, { params: { SQL: SQLparams } })).toEqual(expected);
  });

  it('should return correct string for lt filter', () => {
    const SQLparams = ['param1'];

    const filter = {
      fieldname: {
        lt: 99,
      },
    };

    const expected = '("fieldname" < $2)';

    expect(sqlfilter(filter, { params: { SQL: SQLparams } })).toEqual(expected);
  });

  it('should return correct string for lte filter', () => {
    const SQLparams = ['param1'];

    const filter = {
      fieldname: {
        lte: 99,
      },
    };

    const expected = '("fieldname" <= $2)';

    expect(sqlfilter(filter, { params: { SQL: SQLparams } })).toEqual(expected);
  });

  it('should return correct string for boolean filter', () => {
    const SQLparams = ['param1'];

    const filter = {
      fieldname: {
        boolean: true,
      },
    };

    const expected = '("fieldname" IS true)';

    expect(sqlfilter(filter, { params: { SQL: SQLparams } })).toEqual(expected);
  });

  it('should return correct string for null filter', () => {
    const SQLparams = ['param1'];

    const filter = {
      fieldname: {
        null: 'test',
      },
    };

    const expected = '("fieldname" IS  NULL)';

    expect(sqlfilter(filter, { params: { SQL: SQLparams } })).toEqual(expected);
  });

  it('should return correct string for ni filter', () => {
    const SQLparams = ['param1'];

    const filter = {
      fieldname: {
        ni: 'test',
      },
    };

    const expected = '(NOT "fieldname" = ANY ($2))';

    expect(sqlfilter(filter, { params: { SQL: SQLparams } })).toEqual(expected);
  });

  it('should return correct string for in filter', () => {
    const SQLparams = ['param1'];

    const filter = {
      fieldname: {
        in: 'test',
      },
    };

    const expected = '("fieldname" = ANY ($2))';

    expect(sqlfilter(filter, { params: { SQL: SQLparams } })).toEqual(expected);
  });

  it('should return correct string for like filter', () => {
    const SQLparams = ['param1'];

    const filter = {
      fieldname: {
        like: 'test',
      },
    };

    const expected = '(("fieldname" ILIKE $2))';

    expect(sqlfilter(filter, { params: { SQL: SQLparams } })).toEqual(expected);
  });

  it('should return correct string for match filter', () => {
    const SQLparams = ['param1'];

    const filter = {
      fieldname: {
        match: 'test',
      },
    };

    const expected = '("fieldname"::text = $2)';

    expect(sqlfilter(filter, { params: { SQL: SQLparams } })).toEqual(expected);
  });

  it('should return correct string for multiple filters', () => {
    const SQLparams = ['param1', 'param2'];

    const filter = {
      fieldname_a: {
        eq: '100',
      },
      fieldname_b: {
        gt: '200',
      },
    };

    const expected = '("fieldname_a" = $3 AND "fieldname_b" > $4)';

    expect(sqlfilter(filter, { params: { SQL: SQLparams } })).toEqual(expected);
  });

  it('should return correct string for multiple filters in array', () => {
    const SQLparams = ['param1', 'param2'];

    const filter = [
      {
        fieldname_a: {
          eq: '100',
        },
      },
      {
        fieldname_b: {
          gt: 200,
        },
      },
    ];

    const expected = '(("fieldname_a" = $3) OR ("fieldname_b" > $4))';

    expect(sqlfilter(filter, { params: { SQL: SQLparams } })).toEqual(expected);
  });

  it('should return undefined for invalid field name', () => {
    const SQLparams = ['param1', 'param2'];

    const filter = {
      'invalid-field-name!!!': {
        eq: 'value1',
      },
    };

    expect(sqlfilter(filter, { params: { SQL: SQLparams } })).toEqual(
      undefined,
    );
  });
});
