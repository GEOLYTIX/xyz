module.exports = `

SELECT 
    b.\${field_b} AS \${as} 

FROM
    \${table_a} a,
    \${table_b} b

WHERE
    ST_INTERSECTS(a.\${geom_a}, b.\${geom_b})
    AND a.\${id_a} = %{id}`