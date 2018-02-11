let pgp = require('pg-promise')({
  promiseLib: require('bluebird'),
  noWarnings: true
});
const DBS = {};
Object.keys(process.env).map(function (key) {
  if (key.split('.')[0] === 'DBS')
      DBS[key.split('.')[1]] = pgp(process.env[key])
});

const turf = require('@turf/turf');

function cluster(req, res){

  let xDegree = turf.distance([req.query.west, req.query.north], [req.query.east, req.query.south], {units: 'degrees'});

  let q = `
  SELECT count(1)
  FROM ${req.query.layer}
  WHERE
    ST_DWithin(
      ST_MakeEnvelope(
        ${req.query.west},
        ${req.query.north},
        ${req.query.east},
        ${req.query.south},
        4326),
      geomcntr,
      0.00001
    )
  `
  DBS[req.query.dbs].any(q).then(function(chk){

    let kmeans = parseInt(xDegree * req.query.kmeans) < parseInt(chk[0].count) ?
      parseInt(xDegree * req.query.kmeans) :
      parseInt(chk[0].count);

  q = `
    SELECT
      ST_AsGeoJson(ST_PointOnSurface(ST_Union(geomcntr))) geomj,
      json_agg(json_build_object('id', id, 'competitor', competitor, 'label', label)) infoj
    FROM (
      SELECT
        id,
        competitor,
        label,
        kmeans_cid,
        geomcntr,
        ST_ClusterDBSCAN(geomcntr, ${xDegree * req.query.dbscan}, 1) OVER (PARTITION BY kmeans_cid) dbscan_cid
      FROM (
        SELECT
          ${req.query.qID} AS id,
          ${req.query.competitor} AS competitor,
          ${req.query.label} AS label,
          ST_ClusterKMeans(geomcntr, ${kmeans}) OVER () kmeans_cid,
          geomcntr
        FROM ${req.query.layer}
        WHERE
          ST_DWithin(
            ST_MakeEnvelope(
              ${req.query.west},
              ${req.query.north},
              ${req.query.east},
              ${req.query.south},
              4326),
            geomcntr,
            0.00001
          )
        ) kmeans
      ) dbscan
    GROUP BY kmeans_cid, dbscan_cid;`
    
    //console.log(q);

    DBS[req.query.dbs].any(q).then(function(data){
      if (data.length === 0) {
        res.status(204).json({});
      } else {
        res.status(200).json(Object.keys(data).map(record => {
          return {
            type: 'Feature',
            geometry: JSON.parse(data[record].geomj),
            properties: {
              infoj: data[record].infoj
            }
          }
        }));
      }
    });
  });
}

module.exports = {
    cluster: cluster
};