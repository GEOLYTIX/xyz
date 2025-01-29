export default `
  SELECT distinct(\${field})
  FROM \${table}
  WHERE true \${filter}
  ORDER BY \${field};`;
