export default `
  SELECT
    max(\${field})
    FROM \${table}
    WHERE true \${filter};`;
