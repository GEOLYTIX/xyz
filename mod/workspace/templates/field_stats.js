export default `
  SELECT
    min(\${field}),
    max(\${field}),
    avg(\${field})
    FROM \${table}
    WHERE true \${filter};`;
