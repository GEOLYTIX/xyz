module.exports = `
  SELECT count(1)
  FROM \${table}
  WHERE true \${filter};`