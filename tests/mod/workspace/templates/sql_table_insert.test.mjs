import sql_table_insert from '../../../../mod/workspace/templates/sql_table_insert.js';

//Assigning console.warn to a property to restore original function with.
const originalConsole = console.warn;

//mockWarnings from test so we can assert on them and not get polute the console.
const mockWarnings = [];

//Changing the console.warn function to push to our local collection of messages.
console.warn = (message) => {
  mockWarnings.push(message);
};

await codi.describe(
  {
    name: 'sql_table_insert',
    id: 'template_sql_table_insert',
    parentId: 'template',
  },
  () => {
    codi.it(
      {
        name: 'base test',
        parentId: 'template_sql_table_insert',
      },
      () => {
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

        codi.assertEqual(result, expected);
        codi.assertEqual(mockWarnings[0], expectedWarning);
      },
    );
  },
);

console.warn = originalConsole;
