export default (_) => `
  SELECT
    \${qID} AS ID,
    \${label} AS label,
    array[st_x(st_centroid(\${geom})), st_y(st_centroid(\${geom}))] AS coords
  FROM \${table}
  WHERE true \${filter}
  ORDER BY ST_Point(%{x},%{y}) <#> \${geom} LIMIT ${Number.parseInt(_.n) || 99};`;
