module.exports = {
  render: _ => `
  
  SELECT
    ${_.layer.qID} AS ID,
    ${_.label || _.layer.cluster_label || _.layer.qID} AS label,
    array[st_x(st_centroid(${_.geom || _.layer.geom})), st_y(st_centroid(${_.geom || _.layer.geom}))] AS coords
  FROM ${_.table}
  WHERE true ${_.filter}
  ORDER BY ST_Point(${_.coords}) <#> ${_.geom || _.layer.geom} LIMIT ${_.n || 99};`
}