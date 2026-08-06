import sql_table_insert from '@geolytix/xyz-app/mod/workspace/templates/sql_table_insert.js';
import { describe, expect, it } from 'vitest';
import { mockConsole } from '../../../scaffold.mjs';

//mockWarnings from test so we can assert on them and not pollute the console.
const mockWarnings = mockConsole('warn');

describe('sql_table_insert', () => {
  it('base test', () => {
    const expected = `INSERT INTO test.table
    (letters,numbers)
    SELECT unnest(%{letters}::varchar[]) as letters,unnest(%{numbers}::int[]) as numbers`;

    const expectedWarning =
      'Potential SQL Injection in sql_table_insert request body.';

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
    expect(mockWarnings[0]).toEqual(expectedWarning);
  });
});
