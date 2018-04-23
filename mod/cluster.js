async function cluster(req, res) {
  
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

  //console.log(filter);

  // Check whether string params are found in the settings to prevent SQL injections.
  if (await require('./chk').chkVals([table, geom, cat], res).statusCode === 406) return;

  Object.keys(filter).map(field => {

    if (filter[field].ni && filter[field].ni.length > 0) filter_sql += ` AND ${field} NOT IN ('${filter[field].ni.join("','")}')`;
    if (filter[field].in && filter[field].in.length > 0) filter_sql += ` AND ${field} IN ('${filter[field].in.join("','")}')`;

  });

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

  let result = await global.DBS[req.query.dbs].query(q);

  if (parseInt(result.rows[0].count) === 0) {
    res.status(204).json({});
    return
  }

  let
    count = result.rows[0].count,
    xExtent = result.rows[0].xextent,
    xEnvelope = result.rows[0].xenvelope;

  // Multiply kmeans with the ratio of the cross extent (xExtent) and the cross envelope (xEnvelope).
  kmeans *= xExtent / xEnvelope;

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
    COUNT(cat) count,
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
    ) kmeans
  ) dbscan GROUP BY kmeans_cid, dbscan_cid;`

  //console.log(q);

  result = await global.DBS[req.query.dbs].query(q);

  if (!theme) res.status(200).json(Object.keys(result.rows).map(record => {
    return {
      type: 'Feature',
      geometry: JSON.parse(result.rows[record].geomj),
      properties: {
        count: parseInt(result.rows[record].count)
      }
    }
  }));

  if (theme === 'categorized') res.status(200).json(Object.keys(result.rows).map(record => {
    return {
      type: 'Feature',
      geometry: JSON.parse(result.rows[record].geomj),
      properties: {
        count: parseInt(result.rows[record].count),
        cat: Object.assign({}, ...result.rows[record].cat)
      }
    }
  }));

  if (theme === 'graduated') res.status(200).json(Object.keys(result.rows).map(record => {
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

async function cluster_select(req, res) {
  
  let
    table = req.query.table,
    geom = req.query.geom || 'geom',
    id = req.query.qID,
    filter = JSON.parse(req.query.filter),
    filter_sql = '',
    label = req.query.label,
    dbs = req.query.dbs,
    count = parseInt(req.query.count),
    lnglat = req.query.lnglat.split(',');

  lnglat = lnglat.map(ll => parseFloat(ll));

  // Check whether string params are found in the settings to prevent SQL injections.
  if (await require('./chk').chkVals([table, geom, id, label], res).statusCode === 406) return;

  Object.keys(filter).map(field => {

    if (filter[field].ni && filter[field].ni.length > 0) filter_sql += ` AND ${field} NOT IN ('${filter[field].ni.join("','")}')`;
    if (filter[field].in && filter[field].in.length > 0) filter_sql += ` AND ${field} IN ('${filter[field].in.join("','")}')`;

  });

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

  let result = await global.DBS[req.query.dbs].query(q);

  //console.log(result.rows);

  res.status(200).json(Object.keys(result.rows).map(record => {
    return {
      id: result.rows[record].id,
      label: result.rows[record].label,
      lnglat: result.rows[record].lnglat
    }
  }));

}

module.exports = {
  cluster: cluster,
  cluster_select: cluster_select
};