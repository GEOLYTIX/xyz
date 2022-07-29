const dbs = require('../utils/dbs')()

const sqlFilter = require('../utils/sqlFilter')

const validateRequestParams = require('../utils/validateRequestParams')

const Roles = require('../utils/roles.js')

module.exports = async (req, res) => {

  const layer = req.params.layer;

  // Validate URL parameter
  if (!validateRequestParams(req.params)) {

    return res.status(400).send('URL parameter validation failed.')
  }

  let params = {
    layer,
    table: /^[A-Za-z0-9._-]*$/.test(req.params.table) && req.params.table,
    kmeans: parseInt(1 / req.params.kmeans) || undefined,
    dbscan: parseFloat(req.params.dbscan) || undefined,
    resolution: parseFloat(req.params.resolution || layer.cluster_resolution) || 0.1,
    hexgrid: req.params.hexgrid,
    theme: req.params.theme,
    cat: req.params.cat_template && req.params.workspace.templates[req.params.cat_template].template || req.params.cat || null,
    size: req.params.size || null,
    geom: layer.geom,
    label: req.params.label_template && req.params.workspace.templates[req.params.label_template].template || req.params.label || null,
    geom: layer.geom,
    z: parseFloat(req.params.z),
    aggregate: req.params.aggregate || req.params.theme === 'categorized' && 'array_agg',
    group_by: []
  }

  // Check for role based access.
  const roles = Roles.filter(layer, req.params.user && req.params.user.roles)

  if (!roles && layer.roles) return res.status(403).send('Access prohibited.');

  // Array for storing filter params.
  const SQLparams = []

  // Create filter from roles and provided filter param.
  const filter =
    ` ${layer.filter?.default && 'AND '+layer.filter?.default || ''}
    ${req.params.filter && `AND ${sqlFilter(JSON.parse(req.params.filter), SQLparams)}` || ''}
    ${roles && Object.values(roles).some(r => !!r)
    && `AND ${sqlFilter(Object.values(roles).filter(r => !!r), SQLparams)}`
    || ''}`

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
      ${parseInt(layer.srid)}
    ),
    ${params.geom}
  )
  ${filter}`

  // Query location count and distance across viewport.
  // Only required for kmeans or dbscan algorithm.
  if (params.kmeans || params.dbscan) {

    var q = `
      SELECT
        count(1)::integer,
        ST_Distance(
          ST_Point(${viewport[0]}, ${viewport[1]}),
          ST_Point(${viewport[2]}, ${viewport[3]})
        ) AS xdistance
      FROM ${params.table}
      WHERE ${params.where_sql}`
  
    var rows = await dbs[params.layer.dbs](q, SQLparams)

    if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

    // Location count
    params.count = parseInt(rows[0].count)

    // Distance accross viewport
    params.xdistance = rows[0].xdistance

    // Return empty array if no locations are within filtered viewport.
    if (params.count === 0) return res.send([])
  }
 
  // Generate KMeans cluster algorithm.
  params.kmeans && kmeansAggregation(params)

  // ...and|or DBScan cluster algorithm.
  params.dbscan && dbscanAggregation(params)

  // Generate grid aggregation query if neither kmeans, nor dbscan are provided.
  if (!params.kmeans && !params.dbscan) gridAggregation(params)

  // Assemble query string.
  var q = `
    ${params.with_sql || ''}
    SELECT
      count(1) count,
      ${params.size && 'SUM(size) size,' || ''}
      (array_agg(id))[1] AS id,
      ${params.cat && (params.aggregate || 'sum') + '(cat) cat,' || ''}
      (array_agg(label))[1] AS label,
      ${params.xy_sql}
    FROM ${params.cluster_sql}
    GROUP BY ${params.group_by.join(',')};`

  var rows = await dbs[layer.dbs](q, SQLparams)

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  // Return cluster response.
  return res.send(rows.map(row => ({
    geometry: {
      x: row.x,
      y: row.y,
    },
    properties: {
      id: parseInt(row.count) === 1 && row.id || undefined,
      label: row.label || undefined,
      count: parseInt(row.count),
      size: parseInt(row.size) || undefined,
      cat: params.theme === 'graduated' && parseFloat(row.cat)
        || req.params.aggregate === 'array_agg' && row.cat
        || row.cat?.length === 1 && row.cat[0]
        || undefined
    }
  })))

}

function kmeansAggregation(params){

  // kmeans must not be bigger than the number of rows in group.
  params.kmeans = params.kmeans >= params.count ? params.count : params.kmeans

  params.group_by.push('kmeans_cid')

  params.xy_sql = `
    ST_X(ST_PointOnSurface(ST_Union(geom))) AS x,
    ST_Y(ST_PointOnSurface(ST_Union(geom))) AS y`

  // KMeans cluster algorithm
  params.cluster_sql = `
    (SELECT
      ${params.layer.qID} as id,
      ${params.size} AS size,
      ${params.cat} AS cat,
      ${params.label} AS label,
      ${params.geom} AS geom,
      ST_ClusterKMeans(${params.geom}, ${params.kmeans}) OVER () kmeans_cid
    FROM ${params.table}
    WHERE ${params.where_sql}) kmeans`

}

function dbscanAggregation(params){

  // Multiply dbscan fraction with cross distance accross viewport.
  params.dbscan *= params.xdistance

  params.group_by.push('dbscan_cid')

  params.xy_sql = `
    ST_X(ST_PointOnSurface(ST_Union(geom))) AS x,
    ST_Y(ST_PointOnSurface(ST_Union(geom))) AS y`
  
  if (params.kmeans) {

    // Nest the kmeans cluster_sql within the dbscan algorithm
    params.cluster_sql = `
      (SELECT
        id,
        size,
        cat,
        label,
        geom,
        kmeans_cid,
        ST_ClusterDBSCAN(geom, ${params.dbscan}, 1) OVER (PARTITION BY kmeans_cid) dbscan_cid
      FROM ${params.cluster_sql}) dbscan`

    return;
  }

  // Dbscan only cluster algorithm
  params.cluster_sql = `
    (SELECT
      ${params.layer.qID} as id,
      ${params.size} AS size,
      ${params.cat} AS cat,
      ${params.label} AS label,
      ${params.geom} AS geom,
      ST_ClusterDBSCAN(${params.geom}, ${params.dbscan}, 1) OVER () dbscan_cid
    FROM ${params.table}
    WHERE ${params.where_sql}) dbscan`

}

function gridAggregation(params){

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
          ${params.layer.qID} as id,
          ${params.size} AS size,
          ${params.cat} AS cat,
          ${params.label} AS label,
          ${params.layer.srid == 3857 && params.geom || 'ST_Transform(' + params.geom + ', 3857)'} AS geom,
          ST_X(${params.layer.srid == 3857 && params.geom || 'ST_Transform(' + params.geom + ', 3857)'}) x,
          ST_Y(${params.layer.srid == 3857 && params.geom || 'ST_Transform(' + params.geom + ', 3857)'}) y,
    
          ((ST_Y(${params.layer.srid == 3857 && params.geom || 'ST_Transform(' + params.geom + ', 3857)'}) / ${_height})::integer % 2) odds,
    
          CASE WHEN ((ST_Y(${params.layer.srid == 3857 && params.geom || 'ST_Transform(' + params.geom + ', 3857)'}) / ${_height})::integer % 2) = 0 THEN
            ST_Point(
              round(ST_X(${params.layer.srid == 3857 && params.geom || 'ST_Transform(' + params.geom + ', 3857)'}) / ${_width}) * ${_width},
              round(ST_Y(${params.layer.srid == 3857 && params.geom || 'ST_Transform(' + params.geom + ', 3857)'}) / ${_height}) * ${_height})
    
          ELSE ST_Point(
              round(ST_X(${params.layer.srid == 3857 && params.geom || 'ST_Transform(' + params.geom + ', 3857)'}) / ${_width}) * ${_width} + ${_width / 2},
              round(ST_Y(${params.layer.srid == 3857 && params.geom || 'ST_Transform(' + params.geom + ', 3857)'}) / ${_height}) * ${_height})
    
          END p0                
    
        FROM ${params.table} 
        WHERE ${params.where_sql})`
    
    params.cluster_sql = `
      (SELECT
        id,
        size,
        cat,
        label,
        
        CASE WHEN odds = 0 THEN CASE
      
          WHEN x < ST_X(p0) THEN CASE
      
            WHEN y < ST_Y(p0) THEN CASE
              WHEN (geom <#> ST_Translate(p0, -${_width / 2}, -${_height})) < (geom <#> p0) THEN ST_SnapToGrid(ST_Translate(p0, -${_width / 2}, -${_height}), 1)
              ELSE ST_SnapToGrid(p0, 1)
            END
      
            ELSE CASE
              WHEN (geom <#> ST_Translate(p0, -${_width / 2}, ${_height})) < (geom <#> p0) THEN ST_SnapToGrid(ST_Translate(p0, -${_width / 2}, ${_height}), 1)
              ELSE ST_SnapToGrid(p0, 1)
            END
      
          END
      
          ELSE CASE
            
            WHEN y < ST_Y(p0) THEN CASE
              WHEN (geom <#> ST_Translate(p0, ${_width / 2}, -${_height})) < (geom <#> p0) THEN ST_SnapToGrid(ST_Translate(p0, ${_width / 2}, -${_height}), 1)
              ELSE ST_SnapToGrid(p0, 1)
            END
      
            ELSE CASE
              WHEN (geom <#> ST_Translate(p0, ${_width / 2}, ${_height})) < (geom <#> p0) THEN ST_SnapToGrid(ST_Translate(p0, ${_width / 2}, ${_height}), 1)
              ELSE ST_SnapToGrid(p0, 1)
            END
      
          END          
      
        END
            
        ELSE CASE
          WHEN x < (ST_X(p0) - ${_width / 2}) THEN CASE
            WHEN y < ST_Y(p0) THEN CASE
              WHEN (geom <#> ST_Translate(p0, -${_width / 2}, -${_height})) < (geom <#> ST_Translate(p0, -${_width}, 0)) THEN ST_SnapToGrid(ST_Translate(p0, -${_width / 2}, -${_height}), 1)
              ELSE ST_SnapToGrid(ST_Translate(p0, -${_width}, 0), 1)
            END
      
            ELSE CASE
              WHEN (geom <#> ST_Translate(p0, -${_width / 2}, ${_height})) < (geom <#> ST_Translate(p0, -${_width}, 0)) THEN ST_SnapToGrid(ST_Translate(p0, -${_width / 2}, ${_height}), 1)
              ELSE ST_SnapToGrid(ST_Translate(p0, -${_width}, 0), 1)
            END
      
          END          
      
          ELSE CASE
            WHEN y < ST_Y(p0) THEN CASE
              WHEN (geom <#> ST_Translate(p0, -${_width / 2}, -${_height})) < (geom <#> p0) THEN ST_SnapToGrid(ST_Translate(p0, -${_width / 2}, -${_height}), 1)
              ELSE ST_SnapToGrid(p0, 1)
            END
      
            ELSE CASE
              WHEN (geom <#> ST_Translate(p0, -${_width / 2}, ${_height})) < (geom <#> p0) THEN ST_SnapToGrid(ST_Translate(p0, -${_width / 2}, ${_height}), 1)
              ELSE ST_SnapToGrid(p0, 1)
            END
      
          END          
      
        END
      
      END as point
      FROM first) AS grid`
    
    params.group_by.push('point')
    
    params.xy_sql = `
      ST_X(${params.layer.srid == 3857 && 'point' || 'ST_Transform(ST_SetSRID(point, 3857),'+parseInt(params.layer.srid)+')'}) x,
      ST_Y(${params.layer.srid == 3857 && 'point' || 'ST_Transform(ST_SetSRID(point, 3857),'+parseInt(params.layer.srid)+')'}) y`

    return;
    
  }

  params.group_by.push('x_round')
  params.group_by.push('y_round')

  params.xy_sql = `
    percentile_disc(0.5) WITHIN GROUP (ORDER BY x) x,
    percentile_disc(0.5) WITHIN GROUP (ORDER BY y) y`
  
  params.cluster_sql = `
    (SELECT
      ${params.layer.qID} as id,
      ${params.size} AS size,
      ${params.cat} AS cat,
      ${params.label} AS label,
      ST_X(${params.geom}) AS x,
      ST_Y(${params.geom}) AS y,
      round(ST_X(${params.layer.srid == 3857 && params.geom
        || 'ST_Transform('+params.geom+', 3857)'}) / ${r}) * ${r} x_round,
      round(ST_Y(${params.layer.srid == 3857 && params.geom
        || 'ST_Transform('+params.geom+', 3857)'}) / ${r}) * ${r} y_round
    FROM ${params.table}
    WHERE ${params.where_sql}) grid`

}