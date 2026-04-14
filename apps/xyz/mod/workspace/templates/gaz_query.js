export default `
  SELECT 
  \${label} AS label,
  \${qID} AS id
  FROM \${table}
  WHERE \${qterm}::text ILIKE %{term}
  \${filter}
  LIMIT \${limit};`;
