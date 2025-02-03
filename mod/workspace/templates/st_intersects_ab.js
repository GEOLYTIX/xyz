export default `
SELECT 
    b.\${field_b} AS \${as} 
FROM
    \${table} a
LEFT JOIN
    \${table_b} b
ON ST_INTERSECTS(a.\${geom}, b.\${geom_b})
WHERE a.\${qID} = %{id}
`;
