module.exports = `
  SELECT distinct(\${field})
  FROM \${table}
  ORDER BY \${field};`