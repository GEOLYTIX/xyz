module.exports = `
  SELECT
    min(\${field})
    FROM \${table}
    WHERE true \${filter};`;
