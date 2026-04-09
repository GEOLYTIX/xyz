export default `
  SELECT
    ARRAY[min(\${field}), max(\${field})] as minmax
    FROM \${table}
    WHERE true \${filter} \${viewport};`;
