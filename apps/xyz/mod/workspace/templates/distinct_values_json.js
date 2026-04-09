export default `
  SELECT DISTINCT distinct_field as \${key}
  FROM (
    SELECT \${field} ->> '\${key}' as distinct_field 
    FROM \${table} 
    WHERE true \${filter}
  ) values
  ORDER BY distinct_field;`;
