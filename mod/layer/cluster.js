const dbs = require('../utils/dbs')()

const sqlFilter = require('../utils/sqlFilter')

const validateRequestParams = require('../utils/validateRequestParams')

const Roles = require('../utils/roles.js')

module.exports = async (req, res) => {

  // Validate URL parameter
  if (!validateRequestParams(req.params)) {

    return res.status(400).send('URL parameter validation failed.')
  }

  const params = {
    layer: req.params.layer,
    table: req.params.table,
    resolution: parseFloat(req.params.resolution) || 0.1,
    hexgrid: req.params.hexgrid,
    cat: req.params.workspace.templates[req.params.cat]?.template || req.params.cat || null,      
    label: req.params.workspace.templates[req.params.label]?.template || req.params.label || null,
    z: parseFloat(req.params.z),
    aggregate: req.params.aggregate,
    group_by: []
  }

  // Check for role based access.
  const roles = Roles.filter(params.layer, req.params.user?.roles)

    // No roles found for layer which has roles configured.
    if (!roles && params.layer.roles) {
  
      return res.status(403).send('Access prohibited.');
    }

  // Array for storing filter params.
  const SQLparams = []

  // Create filter from roles and provided filter param.
  const filter = `
    ${params.layer.filter?.default && 'AND '+params.layer.filter?.default || ''}
    ${req.params.filter && `AND ${sqlFilter(JSON.parse(req.params.filter), SQLparams)}` || ''}
    ${roles && Object.values(roles).some(r => !!r)
      && `AND ${sqlFilter(Object.values(roles).filter(r => !!r), SQLparams)}`
      || ''}`

  
  if (req.params.viewport) {

    // Split viewport param.
    const viewport = req.params.viewport.split(',')

    // Create where sql restriction from viewport and filter.
    params.where_sql = `
      ST_Intersects(
        ST_MakeEnvelope(
          ${viewport[0]},
          ${viewport[1]},
          ${viewport[2]},
          ${viewport[3]},
          ${parseInt(params.layer.srid)}
        ),
        ${params.layer.geom})
      ${filter}`

  } else {

    params.where_sql = `true ${filter}`
  }

  if (params.layer.srid !== '3857') {

    console.warn(`Grid resolution cluster layer ${params.layer.key} geometries must be SRID:3857.`)
    return;
  }

  // Calculate grid resolution (r) based on zoom level and resolution parameter.
  let r = parseInt(40075016.68 / Math.pow(2, params.z) * params.resolution);

  if (params.hexgrid) {

    let
      _width = r,
      _height = r - ((r * 2 / Math.sqrt(3)) - r) / 2;
    
    params.with_sql = `
      WITH
      first as (
    
        SELECT
          ${params.layer.qID} AS id,
          ${params.cat} AS cat,
          ${params.label} AS label,
          ${params.layer.geom} AS geom,
          ST_X(${params.layer.geom}) AS x,
          ST_Y(${params.layer.geom}) AS y,
    
          ((ST_Y(${params.layer.geom}) / ${_height})::integer % 2) odds,
    
          CASE WHEN ((ST_Y(${params.layer.geom}) / ${_height})::integer % 2) = 0 THEN
            ST_Point(
              round(ST_X(${params.layer.geom}) / ${_width}) * ${_width},
              round(ST_Y(${params.layer.geom}) / ${_height}) * ${_height})
    
          ELSE ST_Point(
              round(ST_X(${params.layer.geom}) / ${_width}) * ${_width} + ${_width / 2},
              round(ST_Y(${params.layer.geom}) / ${_height}) * ${_height})
    
          END p0                
    
        FROM ${params.table} 
        WHERE ${params.where_sql})`
    
    params.cluster_sql = `
      (SELECT
        id,
        cat,
        label,
        
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
      FROM first
      ) AS grid`
    
    params.group_by.push('point')
    
    params.xy_sql = `
      ST_X(point) x,
      ST_Y(point) y`

  } else {

    // Regular grid aggregation.
    params.group_by.push('x_round')
    params.group_by.push('y_round')
  
    params.xy_sql = `
      x_round x,
      y_round y`
    
    params.cluster_sql = `
      (SELECT
        ${params.layer.qID} as id,
        ${params.cat} AS cat,
        ${params.label} AS label,
        round(ST_X(${params.layer.geom}) / ${r}) * ${r} x_round,
        round(ST_Y(${params.layer.geom}) / ${r}) * ${r} y_round
      FROM ${params.table}
      WHERE ${params.where_sql}) grid`    
  }


  // Assemble query string.
  var q = `
    ${params.with_sql || ''}
    SELECT
      count(1) count,
      (array_agg(id))[1] AS id,
      ${params.cat && `${params.aggregate || 'array_agg'}(cat) cat,` || ''}
      (array_agg(label))[1] AS label,
      ${params.xy_sql}
    FROM ${params.cluster_sql}
    GROUP BY ${params.group_by.join(',')};`

  if (!Object.hasOwn(dbs, params.layer.dbs || req.params.workspace.dbs)) return;

  const query = dbs[params.layer.dbs || req.params.workspace.dbs];

  // Validate query method type.
  if (typeof query !== 'function') return;

  var rows = await query(q, SQLparams)

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  let response = rows.map(row => ({
    geometry: [row.x, row.y],
    properties: {
      id: parseInt(row.count) === 1 && row.id || undefined,
      label: row.label || undefined,
      count: parseInt(row.count),
      cat: (req.params.aggregate === 'array_agg' && row.cat)
        || (!Array.isArray(row.cat) && row.cat)
        || (row.cat?.length === 1 ? row.cat[0] : undefined)
    }
  }))

  // Return cluster response.
  return res.send(response)

}