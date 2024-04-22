module.exports = `

SELECT 
    b.\${field_b} AS \${as},
    ST_DISTANCE(a.\${geom_a}, b.\${geom_b}) AS dist
    
FROM 
    \${table_a} a, 
    \${table_b} b 

WHERE a.\${id_a} = %{id} 
ORDER BY dist 
LIMIT 1`