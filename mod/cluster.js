module.exports = { get, select };

const filters = require('./filters');

async function get(req, res, fastify) {
      
  let
    table = req.query.table,
    geom = req.query.geom === 'undefined' ? 'geom' : req.query.geom,
    cat = req.query.cat === 'undefined' ? null : req.query.cat,
    theme = req.query.theme === 'undefined' ? null : req.query.theme,
    filter = JSON.parse(req.query.filter),
    filter_sql = '',
    kmeans = parseInt(req.query.kmeans),
    dbscan = parseFloat(req.query.dbscan),
    west = parseFloat(req.query.west),
    south = parseFloat(req.query.south),
    east = parseFloat(req.query.east),
    north = parseFloat(req.query.north);

  // Check whether string params are found in the settings to prevent SQL injections.
  if ([table, geom, cat]
    .some(val => (typeof val === 'string' && global.appSettingsValues.indexOf(val) < 0))) {
    return res.code(406).send('Parameter not acceptable.');
  }  

  filter_sql = filters.sql_filter(filter, filter_sql);

  // Query the feature count from lat/lng bounding box.
  let q = `
    SELECT
      count(1)::integer,
      ST_Distance(
        ST_Point(
          ST_XMin(ST_Envelope(ST_Extent(${geom}))),
          ST_YMin(ST_Envelope(ST_Extent(${geom})))
        ),
        ST_Point(
          ST_XMax(ST_Envelope(ST_Extent(${geom}))),
          ST_Ymin(ST_Envelope(ST_Extent(${geom})))
        )
      ) AS xExtent,
      ST_Distance(
        ST_Point(
          ${west},
          ${south}
        ),
        ST_Point(
          ${east},
          ${north}
        )
      ) AS xEnvelope
    FROM ${table}
    WHERE
      ST_DWithin(
        ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326),
        ${geom},
        0.00001)
    ${filter_sql};`;
    
  //console.log(q);

  var db_connection = await fastify.pg[req.query.dbs].connect();
  var result = await db_connection.query(q);
  db_connection.release();

  if (parseInt(result.rows[0].count) === 0) {
    res.code(204).send();
    return
  }

  let
    count = result.rows[0].count,
    xExtent = result.rows[0].xextent,
    xEnvelope = result.rows[0].xenvelope;

  // Multiply kmeans with the ratio of the cross extent (xExtent) and the cross envelope (xEnvelope).
  kmeans *= xExtent / xEnvelope;
  kmeans ++;

  // Check that kmeans is below feature count.
  kmeans = kmeans < count ? parseInt(kmeans): count;

  // console.log({
  //   'kmeans': kmeans,
  //   'dbscan': dbscan
  // });

  if (!theme) q = `
  SELECT
    COUNT(geom) count,
    ST_AsGeoJson(ST_PointOnSurface(ST_Union(geom))) geomj
  FROM (
    SELECT
      kmeans_cid,
      ${geom} AS geom,
      ST_ClusterDBSCAN(${geom}, ${xExtent * dbscan}, 1) OVER (PARTITION BY kmeans_cid) dbscan_cid
    FROM (
      SELECT
        ST_ClusterKMeans(${geom}, ${kmeans}) OVER () kmeans_cid,
        ${geom}
      FROM ${table}
      WHERE
        ST_DWithin(
          ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326),
        ${geom}, 0.00001)
    ) kmeans
  ) dbscan GROUP BY kmeans_cid, dbscan_cid;`

  if (theme === 'categorized') q = `
  SELECT
    SUM(count)::integer count,
    JSON_Agg(JSON_Build_Object(cat, count)) cat,
    ST_AsGeoJson(ST_PointOnSurface(ST_Union(geom))) geomj
  FROM (
    SELECT
      COUNT(cat) count,
      ST_Union(geom) geom,
      cat,
      kmeans_cid,
      dbscan_cid
    FROM (
      SELECT
        cat,
        kmeans_cid,
        ${geom} AS geom,
        ST_ClusterDBSCAN(${geom}, ${xExtent * dbscan}, 1) OVER (PARTITION BY kmeans_cid) dbscan_cid
      FROM (
        SELECT
          ${cat} AS cat,
          ST_ClusterKMeans(${geom}, ${kmeans}) OVER () kmeans_cid,
          ${geom}
        FROM ${table}
        WHERE
          ST_DWithin(
            ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326),
          ${geom}, 0.00001)
        ${filter_sql} 
      ) kmeans
    ) dbscan GROUP BY kmeans_cid, dbscan_cid, cat
  ) cluster GROUP BY kmeans_cid, dbscan_cid;`

  if (theme === 'graduated') q = `
  SELECT
    COUNT(${geom}) count,
    SUM(cat) sum,
    ST_AsGeoJson(ST_PointOnSurface(ST_Union(geom))) geomj
  FROM (
    SELECT
      cat,
      kmeans_cid,
      ${geom} AS geom,
      ST_ClusterDBSCAN(${geom}, ${xExtent * dbscan}, 1) OVER (PARTITION BY kmeans_cid) dbscan_cid
    FROM (
      SELECT
        ${cat} AS cat,
        ST_ClusterKMeans(${geom}, ${kmeans}) OVER () kmeans_cid,
        ${geom}
      FROM ${table}
      WHERE
        ST_DWithin(
          ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326),
        ${geom}, 0.00001)
      ${filter_sql} 
    ) kmeans
  ) dbscan GROUP BY kmeans_cid, dbscan_cid;`

  //console.log(q);
    
  var db_connection = await fastify.pg[req.query.dbs].connect();
  var result = await db_connection.query(q);
  db_connection.release();

  if (!theme) res.code(200).send(Object.keys(result.rows).map(record => {
    return {
      type: 'Feature',
      geometry: JSON.parse(result.rows[record].geomj),
      properties: {
        count: parseInt(result.rows[record].count)
      }
    }
  }));

  if (theme === 'categorized') res.code(200).send(Object.keys(result.rows).map(record => {
    return {
      type: 'Feature',
      geometry: JSON.parse(result.rows[record].geomj),
      properties: {
        count: parseInt(result.rows[record].count),
        cat: Object.assign({}, ...result.rows[record].cat)
      }
    }
  }));

  if (theme === 'graduated') res.code(200).send(Object.keys(result.rows).map(record => {
    return {
      type: 'Feature',
      geometry: JSON.parse(result.rows[record].geomj),
      properties: {
        count: parseInt(result.rows[record].count),
        sum: result.rows[record].sum
      }
    }
  }));
}

async function select(req, res, fastify) {
  
  let
    table = req.query.table,
    geom = req.query.geom || 'geom',
    id = req.query.qID,
    filter = JSON.parse(req.query.filter),
    filter_sql = '',
    label = req.query.label,
    count = parseInt(req.query.count),
    lnglat = req.query.lnglat.split(',');

  lnglat = lnglat.map(ll => parseFloat(ll));

  // Check whether string params are found in the settings to prevent SQL injections.
  if ([table, geom, id, label]
    .some(val => (typeof val === 'string' && global.appSettingsValues.indexOf(val) < 0))) {
    return res.code(406).send('Parameter not acceptable.');
  }  
    
  filter_sql = filters.legend_filter(filter, filter_sql);

  // Query the feature count from lat/lng bounding box.
  let q = `
    SELECT
      ${id} AS ID,
      ${label} AS label,
      array[st_x(st_centroid(${geom})), st_y(st_centroid(${geom}))] AS lnglat
      FROM ${table}
      WHERE true 
      ${filter_sql} 
      ORDER BY ST_Point(${lnglat}) <#> geom LIMIT ${count};`;

  var db_connection = await fastify.pg[req.query.dbs].connect();
  var result = await db_connection.query(q);
  db_connection.release();

  //console.log(result.rows);

  res.code(200).send(Object.keys(result.rows).map(record => {
    return {
      id: result.rows[record].id,
      label: result.rows[record].label,
      lnglat: result.rows[record].lnglat
    }
  }));

}