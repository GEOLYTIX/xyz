module.exports = `
  SELECT count(*)
  FROM \${table}
  WHERE true \${filter};`