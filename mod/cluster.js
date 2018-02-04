const pgp = require('pg-promise')({
    promiseLib: require('bluebird'),
    noWarnings: true
});

const db = pgp(process.env.POSTGRES);
const db_cluster = pgp(process.env.POSTGRES_MVT);

const turf = require('@turf/turf');

function cluster(req, res){
    //ST_ClusterKMeans(geomcntr, 200) OVER () AS cid,
    //ST_ClusterDBSCAN(geomcntr, ${parseFloat(req.query.dist)}, 1) OVER () AS cid,
    let q = `
    SELECT
      ST_AsGeoJson(ST_PointOnSurface(ST_Union(cluster.geomcntr))) AS geomj,
      json_agg(json_build_object('id', cluster.id, 'brand', cluster.brand, 'label', cluster.label)) AS infoj,
      count(cluster.geomcntr) AS c
    FROM (
      SELECT
        ${req.query.qid} AS id,
        ${req.query.brand} AS brand,
        ${req.query.label} AS label,
        ST_ClusterKMeans(geomcntr, 200) OVER () AS cid,
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
    ) cluster
    GROUP BY cluster.cid;`
    
    console.log(q);

    
    db_cluster.any(q).then(function(data){

      let xDist = turf.distance([req.query.west, req.query.south], [req.query.east, req.query.north]);
      let minD = xDist / 75;
      let maxD = xDist / 15;
      let rangeD = maxD - minD;

      let features = data.map(f => {
        let feature = {
          type: 'Feature',
          geometry: JSON.parse(f.geomj),
          properties: { c: parseInt(f.c) }
        };
        return feature
      });

      features.sort((a, b) =>
        a.properties.c > b.properties.c ? -1 :
          a.properties.c < b.properties.c ? 1 : 0);

      let max = Math.max(...features.map(f => f.properties.c));

      let circles = features.map(f => {
        let circle = turf.circle(
          [f.geometry.coordinates[0], f.geometry.coordinates[1]],
          minD + rangeD / max * f.properties.c,
          {
            units: 'kilometers',
            steps: 6
          });
        circle.properties = f.properties;
        return circle;
      });
      

      let cluster = [];
      for (let i = 0; i < circles.length; i++) {
      
        let hx_prime = circles[i];
        let hx_union = Object.assign({}, hx_prime);
      
        circles = circles.filter(function(hx_check) {
          if (turf.booleanOverlap(hx_prime, hx_check)) {
            hx_union = turf.union(hx_union, hx_check);
            hx_union.properties.c = hx_prime.properties.c + hx_check.properties.c
      
          } else {
            return hx_check
      
          }
        });
        cluster.push(hx_union);
      }
          

      clusterP = cluster.map(f => {
        let center = turf.centroid(f);
        center.properties.c = f.properties.c
        return center;
      });
          
        res.status(200).json(clusterP);
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