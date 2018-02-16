let pgp = require('pg-promise')({
  promiseLib: require('bluebird'),
  noWarnings: true
});
const DBS = {};
Object.keys(process.env).map(function (key) {
  if (key.split('_')[0] === 'DBS')
      DBS[key.split('_')[1]] = pgp(process.env[key])
});

const turf = require('@turf/turf');

function cluster(req, res) {

  let xDegree = turf.distance([req.query.west, req.query.north], [req.query.east, req.query.south], { units: 'degrees' });

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
        ${req.query.geom},
      0.00001
    )
  `
  DBS[req.query.dbs].any(q)
    .then(chk => {

      let kmeans = parseInt(xDegree * req.query.kmeans) < parseInt(chk[0].count) ?
        parseInt(xDegree * req.query.kmeans) :
        parseInt(chk[0].count);

      q = `
      SELECT
        ST_AsGeoJson(ST_PointOnSurface(ST_Union(${req.query.geom}))) geomj,
        json_agg(json_build_object('id', id, ${req.query.competitor?"'competitor', competitor,":""} 'label', label)) infoj
      FROM (
        SELECT
          id,
          competitor,
          label,
          kmeans_cid,
          ${req.query.geom},
          ST_ClusterDBSCAN(${req.query.geom}, ${xDegree * req.query.dbscan}, 1) OVER (PARTITION BY kmeans_cid) dbscan_cid
        FROM (
          SELECT
            ${req.query.qID} AS id,
            ${req.query.competitor} AS competitor,
            ${req.query.label} AS label,
            ST_ClusterKMeans(${req.query.geom}, ${kmeans}) OVER () kmeans_cid,
            ${req.query.geom}
          FROM ${req.query.layer}
          WHERE
            ST_DWithin(
              ST_MakeEnvelope(
                ${req.query.west},
                ${req.query.north},
                ${req.query.east},
                ${req.query.south},
                4326),
                ${req.query.geom},
              0.00001
            )
          ) kmeans
        ) dbscan
      GROUP BY kmeans_cid, dbscan_cid;`

      //console.log(q);

      return DBS[req.query.dbs].any(q)
      .then(data => {
        if (data.length === 0) {
          return res.status(204).json({});
        } else {
          return res.status(200).json(Object.keys(data).map(record => {
            return {
              type: 'Feature',
              geometry: JSON.parse(data[record].geomj),
              properties: {
                infoj: data[record].infoj
              }
            }
          }));
        }
      })
      .catch(error => {
        console.log(error);
      });
    })
    .catch(error => {
      console.log(error);
    });

}

module.exports = {
    cluster: cluster
};