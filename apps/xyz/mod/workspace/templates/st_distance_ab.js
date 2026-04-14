export default `
SELECT 
    ST_DISTANCE(st_transform(a.\${geom},4326)::geography, closest.geom ) AS dist
FROM 
    \${table} a
LEFT JOIN LATERAL (
    SELECT
        st_transform(b.\${geom_b},4326)::geography as geom
    FROM \${table_b} b 
    ORDER BY st_transform(b.\${geom_b},4326)::geography <-> st_transform(a.\${geom},4326)::geography
    LIMIT 1
) closest
on true
WHERE a.\${qID} = %{id}
`;
