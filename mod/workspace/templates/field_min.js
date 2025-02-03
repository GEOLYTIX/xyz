export default `
  SELECT
    min(\${field})
    FROM \${table}
    WHERE true \${filter};`;
