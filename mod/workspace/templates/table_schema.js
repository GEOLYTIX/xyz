/**
### /workspace/templates/table_schema

The table_schema query returns the table schema columns from the PostgreSQL INFORMATION_SCHEMA.

@module /workspace/templates/table_schema
*/
export default `
SELECT 
  column_name,
  data_type,
  udt_name,
  character_maximum_length,
  column_default,
  is_nullable
FROM INFORMATION_SCHEMA.COLUMNS
WHERE table_schema = %{table_schema}
AND table_name = %{table}
ORDER BY ordinal_position;`;
