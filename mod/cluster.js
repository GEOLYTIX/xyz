const turf = require('@turf/turf');

async function cluster(req, res) {
  try {

    let
      layer = req.query.layer,
      id = req.query.qID === 'undefined' ? null : req.query.qID,
      geom = req.query.geom,
      label = req.query.label,
      cat = req.query.cat === 'undefined' ? null : req.query.cat,
      kmeans = parseFloat(req.query.kmeans),
      dbscan = parseFloat(req.query.dbscan),
      west = parseFloat(req.query.west),
      south = parseFloat(req.query.south),
      east = parseFloat(req.query.east),
      north = parseFloat(req.query.north),
      xDegree = turf.distance([west, north], [east, south], { units: 'degrees' });

    // Check whether string params are found in the settings to prevent SQL injections.
    if (await require('./chk').chkVals([layer, id, geom, label, cat], res).statusCode === 406) return;

    // Query the feature count from lat/lng bounding box.
    let q = `
    SELECT count(1)
    FROM ${layer}
    WHERE
      ST_DWithin(
        ST_MakeEnvelope(${west}, ${north}, ${east}, ${south}, 4326),
        ${geom},
        0.00001);`;

    let result = await global.DBS[req.query.dbs].query(q);

    if (parseInt(result.rows[0].count) === 0) {
      res.status(204).json({});
      return
    }

    // Use feature count with cross distance  to determine the kmeans factor.
    kmeans = parseInt(xDegree * kmeans) < parseInt(result.rows[0].count) ?
      parseInt(xDegree * kmeans) :
      parseInt(result.rows[0].count);

    // Use kmeans within dbscan function to query the cluster features.
    q = `
    SELECT
      ST_AsGeoJson(ST_PointOnSurface(ST_Union(${geom}))) geomj,
      json_agg(json_build_object('id', id, ${cat ? "'cat', cat," : ""} 'label', label)) infoj
    FROM (
      SELECT
        id,
        cat,
        label,
        kmeans_cid,
        ${geom},
        ST_ClusterDBSCAN(${geom}, ${xDegree * dbscan}, 1) OVER (PARTITION BY kmeans_cid) dbscan_cid
      FROM (
        SELECT
          ${id} as id,
          ${cat} as cat,
          ${label} as label,
          ST_ClusterKMeans(${geom}, ${kmeans}) OVER () kmeans_cid,
          ${geom}
        FROM ${layer}
        WHERE
          ST_DWithin(
            ST_MakeEnvelope(${west}, ${north}, ${east}, ${south}, 4326),
            ${geom}, 0.00001)
      ) kmeans
    ) dbscan GROUP BY kmeans_cid, dbscan_cid;`

    //console.log(q);

    result = await global.DBS[req.query.dbs].query(q);

    // Map the records and return json to client.
    res.status(200).json(Object.keys(result.rows).map(record => {
      return {
        type: 'Feature',
        geometry: JSON.parse(result.rows[record].geomj),
        properties: {
          infoj: result.rows[record].infoj
        }
      }
    }));

  } catch (err) {
    console.error(err)
  }
}

module.exports = {
  cluster: cluster
};