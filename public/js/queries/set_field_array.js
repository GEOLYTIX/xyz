module.exports = `
  UPDATE \${table}
  SET \${field} = array_\${action}(\${field}, %{value})
  WHERE \${qID} = %{id};`