/**
### /workspace/templates/cluster_hex

The cluster_hex layer query template returns aggregated cluster features.

@module /workspace/templates/cluster_hex
*/
module.exports = _ => {

  _.qID ??= _.layer.qID || null
  _.geom ??= _.layer.geom

  // Get fields array from query params.
  const fields = _.fields?.split(',')
    .map(field => `${_.workspace.templates[field]?.template || field} as ${field}`)

  const aggFields = _.fields?.split(',')
    .map(field => `CASE WHEN count(*)::int = 1 THEN (array_agg(${field}))[1] END as ${field}`)

  const where = _.viewport || `AND ${_.geom} IS NOT NULL`

  // Calculate grid resolution (r) based on zoom level and resolution parameter.
  const r = parseInt(40075016.68 / Math.pow(2, _.z) * _.resolution);

  const _width = r;
  const _height = r - ((r * 2 / Math.sqrt(3)) - r) / 2;

  return `
  WITH first as (

    SELECT
      ${_.qID} AS id,
      ${_.fields ? fields.join() + ',' : ''}
      ${_.geom} AS geom,
      ST_X(${_.geom}) AS x,
      ST_Y(${_.geom}) AS y,

      ((ST_Y(${_.geom}) / ${_height})::integer % 2) odds,

      CASE WHEN ((ST_Y(${_.geom}) / ${_height})::integer % 2) = 0 THEN
        ST_Point(
          round(ST_X(${_.geom}) / ${_width}) * ${_width},
          round(ST_Y(${_.geom}) / ${_height}) * ${_height})
  
      ELSE ST_Point(
        round(ST_X(${_.geom}) / ${_width}) * ${_width} + ${_width / 2},
        round(ST_Y(${_.geom}) / ${_height}) * ${_height})

      END p0

    FROM ${_.table}
    WHERE TRUE ${where} \${filter})

    SELECT
      ARRAY[ST_X(point), ST_Y(point)],
      count(*)::int,
      CASE
        WHEN count(*)::int = 1 THEN (array_agg(id))[1]::varchar
        ELSE CONCAT('!',(array_agg(id))[1]::varchar)
        END AS id

      ${_.fields ? ',' + aggFields.join() : ''}

    FROM (
    SELECT
      ${_.qID} as id,
      ${_.fields ? fields.join() + ',' : ''}

      CASE WHEN odds = 0 THEN CASE

        WHEN x < ST_X(p0) THEN CASE

          WHEN y < ST_Y(p0) THEN CASE
            WHEN (geom <#> ST_Translate(p0, -${_width / 2}, -${_height})) < (geom <#> p0) 
              THEN ST_SnapToGrid(ST_Translate(p0, -${_width / 2}, -${_height}), 1)
              ELSE ST_SnapToGrid(p0, 1)
            END

          ELSE CASE
            WHEN (geom <#> ST_Translate(p0, -${_width / 2}, ${_height})) < (geom <#> p0) 
              THEN ST_SnapToGrid(ST_Translate(p0, -${_width / 2}, ${_height}), 1)
              ELSE ST_SnapToGrid(p0, 1)
            END

          END

          ELSE CASE
            WHEN y < ST_Y(p0) THEN CASE
              WHEN (geom <#> ST_Translate(p0, ${_width / 2}, -${_height})) < (geom <#> p0) 
                THEN ST_SnapToGrid(ST_Translate(p0, ${_width / 2}, -${_height}), 1)
                ELSE ST_SnapToGrid(p0, 1)
              END

            ELSE CASE
              WHEN (geom <#> ST_Translate(p0, ${_width / 2}, ${_height})) < (geom <#> p0) 
                THEN ST_SnapToGrid(ST_Translate(p0, ${_width / 2}, ${_height}), 1)
                ELSE ST_SnapToGrid(p0, 1)
              END

            END          

          END

        ELSE CASE
          WHEN x < (ST_X(p0) - ${_width / 2}) THEN CASE
            WHEN y < ST_Y(p0) THEN CASE
              WHEN (geom <#> ST_Translate(p0, -${_width / 2}, -${_height})) < (geom <#> ST_Translate(p0, -${_width}, 0)) 
                THEN ST_SnapToGrid(ST_Translate(p0, -${_width / 2}, -${_height}), 1)
              ELSE ST_SnapToGrid(ST_Translate(p0, -${_width}, 0), 1)
            END

            ELSE CASE
              WHEN (geom <#> ST_Translate(p0, -${_width / 2}, ${_height})) < (geom <#> ST_Translate(p0, -${_width}, 0)) 
                THEN ST_SnapToGrid(ST_Translate(p0, -${_width / 2}, ${_height}), 1)
              ELSE ST_SnapToGrid(ST_Translate(p0, -${_width}, 0), 1)
            END

          END

          ELSE CASE
            WHEN y < ST_Y(p0) THEN CASE
              WHEN (geom <#> ST_Translate(p0, -${_width / 2}, -${_height})) < (geom <#> p0) 
                THEN ST_SnapToGrid(ST_Translate(p0, -${_width / 2}, -${_height}), 1)
              ELSE ST_SnapToGrid(p0, 1)
            END

            ELSE CASE
              WHEN (geom <#> ST_Translate(p0, -${_width / 2}, ${_height})) < (geom <#> p0) 
                THEN ST_SnapToGrid(ST_Translate(p0, -${_width / 2}, ${_height}), 1)
              ELSE ST_SnapToGrid(p0, 1)
            END

          END

        END

      END as point
    FROM first) AS grid

  GROUP BY point;`
}
