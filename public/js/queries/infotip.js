module.exports = {
  render: _ => {

    if (!_.coords) return `
    SELECT \${field} AS label
    FROM \${table}
    WHERE \${qID}::text = %{id}::text`

    const coords = _.coords.split(',').map(val => parseFloat(val))
 
    return `
    SELECT \${field} AS label
    FROM \${table}
    ORDER BY ST_Point(${coords[0]},${coords[1]}) <#> \${geom} LIMIT 1`

  }
}