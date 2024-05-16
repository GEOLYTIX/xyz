module.exports = 
    `SELECT DISTINCT distinct_field 
     FROM (
            SELECT \${field} ->> \${key} as distinct_field 
            FROM \${table} 
            WHERE true \${filter}) 
    ORDER BY distinct_field;`

  