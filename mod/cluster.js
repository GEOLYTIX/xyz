const pgp = require('pg-promise')({
    promiseLib: require('bluebird'),
    noWarnings: true
});

const db = pgp(process.env.POSTGRES);
const db_cluster = pgp(process.env.POSTGRES_MVT);

const turf = require('@turf/turf');

function cluster(req, res){

  let xDegree = turf.distance([req.query.west, req.query.north], [req.query.east, req.query.south], {units: 'degrees'});

  let q = `
    SELECT
      ST_AsGeoJson(ST_PointOnSurface(ST_Union(geomcntr))) geomj,
      json_agg(json_build_object('id', qid, 'brand', brand, 'label', label)) infoj
    FROM (
      SELECT
        qid,
        brand,
        label,
        kmeans_cid,
        geomcntr,
        ST_ClusterDBSCAN(geomcntr, ${xDegree * 0.0075}, 1) OVER (PARTITION BY kmeans_cid) dbscan_cid
      FROM (
        SELECT
          ${req.query.qid} AS qid,
          ${req.query.brand} AS brand,
          ${req.query.label} AS label,
          ST_ClusterKMeans(geomcntr, ${parseInt(xDegree * 4)}) OVER () kmeans_cid,
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

    db_cluster.any(q).then(function(data){
      res.status(200).json(data);
    });
}

function cluster_info(req, res){
    let q = `
    SELECT
      geomj,
      infoj,
      ${req.query.vector} AS vector
    FROM ${req.query.layer}
    WHERE ${req.query.qid} = ${req.query.id};`

    // console.log(q);

    db.any(q).then(function (data) {
        res.status(200).json(data);
    });
}

module.exports = {
    cluster: cluster,
    cluster_info: cluster_info
};