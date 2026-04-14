/**
### /workspace/templates/infotip

The infotip layer query returns a field property value from the location nearest to the provided coordinate.

@module /workspace/templates/infotip
*/
export default (_) => {
  if (!_.coords)
    return `
    SELECT \${field} AS label
    FROM \${table}
    WHERE \${qID} = %{id} \${filter}`;

  const coords = _.coords.split(',').map((val) => parseFloat(val));

  return `
    SELECT \${field} AS label
    FROM \${table}
    WHERE true \${filter}
    ORDER BY ST_Point(${coords[0]},${coords[1]}) <#> \${geom} LIMIT 1`;
};
