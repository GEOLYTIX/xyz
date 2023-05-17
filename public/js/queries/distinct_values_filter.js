module.exports = 
`
  SELECT distinct(\${field})
  FROM \${table}
  WHERE \${filter_string}
  ORDER BY \${field};`;