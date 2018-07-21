module.exports = { get, select };

async function get(req, res, fastify) {

  let
    table = req.query.table,
    geom = req.query.geom == 'undefined' ? 'geom' : req.query.geom,
    cat = req.query.cat == 'undefined' ? null : req.query.cat,
    size = req.query.size == 'undefined' ? 1 : req.query.size,
    theme = req.query.theme == 'undefined' ? null : req.query.theme,
    filter = req.query.filter == 'undefined' ? null : JSON.parse(req.query.filter),
    kmeans = parseInt(1 / req.query.kmeans),
    dbscan = parseFloat(req.query.dbscan),
    west = parseFloat(req.query.west),
    south = parseFloat(req.query.south),
    east = parseFloat(req.query.east),
    north = parseFloat(req.query.north),
    user = fastify.jwt.decode(req.cookies.xyz_user);

  // Check whether string params are found in the settings to prevent SQL injections.
  if ([table, geom, cat]
    .some(val => (typeof val === 'string' && global.workspace[user.access].values.indexOf(val) < 0))) {
    return res.code(406).send('Parameter not acceptable.');
  }  

  let filter_sql = filter ? require('./filters').sql_filter(filter) : '';

  // Query the feature count from lat/lng bounding box.
  var q = `
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
      ST_Point(${west}, ${south}),
      ST_Point(${east}, ${north})
    ) AS xEnvelope
  FROM ${table}
  WHERE
    ST_DWithin(
      ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326),
        ${geom},
        0.00001)
    ${filter_sql};`;

  var db_connection = await fastify.pg[req.query.dbs].connect();
  var result = await db_connection.query(q);
  db_connection.release();

  // return 204 if no locations found within the envelope.
  if (parseInt(result.rows[0].count) === 0) return res.code(204).send();

  let
    count = result.rows[0].count,
    xExtent = result.rows[0].xextent,
    xEnvelope = result.rows[0].xenvelope;

  if (kmeans >= count) kmeans = count;

  if ((xExtent / xEnvelope) <= dbscan) kmeans = 1;

  dbscan *= xEnvelope;

  if (!theme) q = `
  SELECT
    COUNT(geom) count,
    ST_AsGeoJson(ST_PointOnSurface(ST_Union(geom))) geomj
  FROM (
    SELECT
      kmeans_cid,
      ${geom} AS geom,
      ST_ClusterDBSCAN(${geom}, ${dbscan}, 1) OVER (PARTITION BY kmeans_cid) dbscan_cid
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
        ST_ClusterDBSCAN(${geom}, ${dbscan}, 1) OVER (PARTITION BY kmeans_cid) dbscan_cid
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
    SUM(size) size,
    SUM(cat) sum,
    ST_AsGeoJson(ST_PointOnSurface(ST_Union(geom))) geomj
  FROM (
    SELECT
      cat,
      size,
      kmeans_cid,
      ${geom} AS geom,
      ST_ClusterDBSCAN(${geom}, ${dbscan}, 1) OVER (PARTITION BY kmeans_cid) dbscan_cid
    FROM (
      SELECT
        ${cat} AS cat,
        ${size} AS size,
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
        size: parseInt(result.rows[record].size),
        sum: result.rows[record].sum
      }
    }
  }));
}

async function select(req, res, fastify) {
  
  let
    table = req.query.table,
    geom = req.query.geom === 'undefined' ? 'geom' : req.query.geom,
    id = req.query.qID === 'undefined' ? 'id' : req.query.qID,
    filter = typeof req.query.filter == 'undefined' ? null : JSON.parse(req.query.filter),
    label = req.query.label === 'undefined' ? id : req.query.label,
    count = parseInt(req.query.count),
    lnglat = req.query.lnglat.split(','),
    user = fastify.jwt.decode(req.cookies.xyz_user);

  lnglat = lnglat.map(ll => parseFloat(ll));

  // Check whether string params are found in the settings to prevent SQL injections.
  if ([table, geom, id, label]
    .some(val => (typeof val === 'string' && global.workspace[user.access].values.indexOf(val) < 0))) {
    return res.code(406).send('Parameter not acceptable.');
  }

  let filter_sql = filter ? require('./filters').legend_filter(filter) : '';

  // Query the feature count from lat/lng bounding box.
  var q = `
  SELECT
    ${id} AS ID,
    ${label} AS label,
    array[st_x(st_centroid(${geom})), st_y(st_centroid(${geom}))] AS lnglat
  FROM ${table}
  WHERE true 
    ${filter_sql} 
  ORDER BY ST_Point(${lnglat}) <#> ${geom} LIMIT ${count};`;

  var db_connection = await fastify.pg[req.query.dbs].connect();
  var result = await db_connection.query(q);
  db_connection.release();

  res.code(200).send(Object.keys(result.rows).map(record => {
    return {
      id: result.rows[record].id,
      label: result.rows[record].label,
      lnglat: result.rows[record].lnglat
    }
  }));
}