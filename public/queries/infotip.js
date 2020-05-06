module.exports = {
  render: _ => `
  
  SELECT ${_.field}
  FROM ${_.table}
  ${_.coords && `ORDER BY ST_Point(${_.coords}) <#> ${_.layer.geom} LIMIT 1;` || `WHERE ${_.layer.qID} = ${_.id};`}`
}