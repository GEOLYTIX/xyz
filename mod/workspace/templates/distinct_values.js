module.exports = `
  SELECT distinct(\${field})
  FROM \${table}
  WHERE true \${filter}
  ORDER BY \${field};`;
