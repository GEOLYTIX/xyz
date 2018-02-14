let pgp = require('pg-promise')({
    promiseLib: require('bluebird'),
    noWarnings: true
});
const DBS = {};
Object.keys(process.env).map(function (key) {
    if (key.split('_')[0] === 'DBS')
        DBS[key.split('_')[1]] = pgp(process.env[key])
  });

function geojson(req, res) {
    let q =
    `SELECT 
       ${req.query.qID} AS id,
       ${req.query.geomj} AS geomj
     FROM ${req.query.table}
     WHERE
       ST_DWithin(
         ST_MakeEnvelope(
           ${req.query.west},
           ${req.query.south},
           ${req.query.east},
           ${req.query.north},
           4326),
        ${req.query.geom},
        0.000001);`

    //console.log(q);

    DBS[req.query.dbs].any(q)
        .then(data => {
            res.status(200).json(Object.keys(data).map(record => {
                return {
                    type: 'Feature',
                    geometry: JSON.parse(data[record].geomj),
                    properties: {
                        id: data[record].id
                    }
                }
            }));
        })
        .catch(error => {
            console.log(error);
        });
}

module.exports = {
    geojson: geojson
};