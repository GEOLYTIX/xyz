module.exports = 
`
  SELECT distinct(\${field})
  FROM \${table}
  WHERE \${filter}
  ORDER BY \${field};`;