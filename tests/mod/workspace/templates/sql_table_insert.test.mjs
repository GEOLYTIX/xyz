import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import sql_table_insert from '../../../../mod/workspace/templates/sql_table_insert.js';

//Assigning console.warn to a property to restore original function with.
const originalConsole = console.warn;

//mockWarnings from test so we can assert on them and not get polute the console.
const mockWarnings = [];

beforeAll(() => {
  //Changing the console.warn function to push to our local collection of messages.
  console.warn = (message) => {
    mockWarnings.push(message);
  };
});

afterAll(() => {
  console.warn = originalConsole;
});

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
