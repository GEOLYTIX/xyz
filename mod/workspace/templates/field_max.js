module.exports = `
  SELECT
    max(\${field})
    FROM \${table}
    WHERE true \${filter};`;
