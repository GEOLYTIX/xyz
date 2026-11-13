import sql_table_insert from '@geolytix/xyz-app/mod/workspace/templates/sql_table_insert.js';
import { describe, expect, it } from 'vitest';
import { mockConsole } from '../../../scaffold.mjs';

//mockWarnings from test so we can assert on them and not pollute the console.
const mockWarnings = mockConsole('warn');

const expectedWarning =
  'Potential SQL Injection in sql_table_insert request body.';

describe('sql_table_insert', () => {
  it('base test', () => {
    const expected = `INSERT INTO test.table
    (letters,numbers)
    SELECT unnest(%{body_letters}::varchar[]) as letters,unnest(%{body_numbers}::int[]) as numbers`;

    const req = {
      table: 'test.table',
      body: {
        'letters::varchar': ['a', 'b'],
        'drop table (table)': [1, 2], // Potential SQL Injection
        'numbers::int': [1, 2],
      },
    };

    const result = sql_table_insert(req);

    expect(result).toEqual(expected);
    expect(mockWarnings.at(-1)).toEqual(expectedWarning);
    expect(req.body_letters).toEqual(['a', 'b']);
    expect(req.body_numbers).toEqual([1, 2]);
  });

  it('does not overwrite the template params with body keys', () => {
    const req = {
      table: 'test.table',
      body: {
        'table::varchar': ['pg_catalog.pg_class SELECT 1; --'],
      },
    };

    const result = sql_table_insert(req);

    expect(result).toContain('INSERT INTO test.table');
    expect(req.table).toBe('test.table');
    expect(req.body_table).toEqual(['pg_catalog.pg_class SELECT 1; --']);
  });

  it.each([
    ['a key without a cast', 'letters'],
    ['a key with two casts', 'letters::int::varchar'],
    ['a cast with a comment', 'letters::int--'],
    ['a field starting with a number', '1letters::int'],
  ])('skips %s', (_, key) => {
    const req = { table: 'test.table', body: { [key]: [1] } };

    const result = sql_table_insert(req);

    expect(result).not.toContain('letters');
    expect(mockWarnings.at(-1)).toEqual(expectedWarning);
  });
});
