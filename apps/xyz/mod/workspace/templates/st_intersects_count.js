export default `
SELECT 
   COUNT(b.*) AS count
FROM
    \${table} a
LEFT JOIN
    \${table_b} b
ON ST_INTERSECTS(a.\${geom}, b.\${geom_b})
WHERE a.\${qID} = %{id}
`;
