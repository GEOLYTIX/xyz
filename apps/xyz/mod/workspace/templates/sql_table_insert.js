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

The field name and the cast must be SQL identifiers. Properties with other keys are skipped.

The values are substituted as query params. The params are assigned with a `body_` prefix, so a body key can't overwrite a param of the template, eg. the table.

@module /workspace/templates/sql_table_insert
*/

/**
Field names and casts [body key parts] must be SQL identifiers.
*/
const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

export default (_) => {
  const fields = [];
  const unnests = [];

  for (const [key, value] of Object.entries(_.body)) {
    // Split key into field and type array
    const field_type = key.split('::');

    // Check for SQL Injection in the property key.
    if (
      field_type.length !== 2 ||
      field_type.some((string) => !IDENTIFIER.test(string))
    ) {
      console.warn(`Potential SQL Injection in sql_table_insert request body.`);
      continue;
    }

    const [field, cast] = field_type;

    // The param for the value substitution.
    const param = `body_${field}`;

    _[param] = value;
    fields.push(field);
    unnests.push(`unnest(%{${param}}::${cast}[]) as ${field}`);
  }

  const sql = `INSERT INTO ${_.table}
    (${fields.join(',')})
    SELECT ${unnests.join(',')}`;

  return sql;
};
