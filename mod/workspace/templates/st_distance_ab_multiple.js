export default `
SELECT 
    closest.field_b AS \${as},
    ST_DISTANCE(st_transform(a.\${geom},4326)::geography, closest.geom ) AS dist
FROM 
    \${table} a
LEFT JOIN LATERAL (
    SELECT
        b.\${field_b} as field_b,
        st_transform(b.\${geom_b},4326)::geography as geom
    FROM \${table_b} b 
    ORDER BY st_transform(b.\${geom_b},4326)::geography <-> st_transform(a.\${geom},4326)::geography
    LIMIT \${limit}
) closest
on true
WHERE a.\${qID} = %{id}
`;
