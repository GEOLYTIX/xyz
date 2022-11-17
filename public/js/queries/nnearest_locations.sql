SELECT *
  FROM ${table}
  WHERE true ${filter}
  ORDER BY ST_Point(%{x},%{y}) <#> ${geom} LIMIT ${n};