/**
## /workspace/templates/sql_table_insert

The sql_table_insert query template module allows to insert multiple records provided as a request POST body into a SQL table.

The POST body must contain properties for each field. The key will be split on :: to provide the field name and the cast for values in the values array.
```
{
  "letters::varchar": [
    "a",
    "b"
  ],
  "drop table (table)": [1,2], // Potential SQL Injection
  "numbers::int": [
    1,
    2
  ]
}
```

@module /workspace/templates/sql_table_insert
*/
export default (_) => {
  const fields = [];
  const unnests = [];

  for (const [key, value] of Object.entries(_.body)) {
    // Split key into field and type array
    const field_type = key.split('::');

    // Check for SQL Injection in the property key.
    if (field_type.some((string) => !/^[A-Za-z0-9_-]*$/.exec(string))) {
      console.warn(`Potential SQL Injection in sql_table_insert request body.`);
      continue;
    }

    _[field_type[0]] = value;
    fields.push(field_type[0]);
    unnests.push(
      `unnest(%{${field_type[0]}}::${field_type[1]}[]) as ${field_type[0]}`,
    );
  }

  const sql = `INSERT INTO ${_.table}
    (${fields.join(',')})
    SELECT ${unnests.join(',')}`;

  return sql;
};
