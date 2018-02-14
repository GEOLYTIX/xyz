let pgp = require('pg-promise')({
    promiseLib: require('bluebird'),
    noWarnings: true
});
const DBS = {};
Object.keys(process.env).map(function (key) {
    if (key.split('_')[0] === 'DBS')
        DBS[key.split('_')[1]] = pgp(process.env[key])
  });

function save(req, res) {

    let q =
    `INSERT INTO ${req.body.table} (geom)
       SELECT ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(req.body.geometry)}'), 4326) AS geom
       RETURNING id;`

    console.log(q);
             
    DBS[req.body.dbs].one(q)
    .then(id => {

        // let feature = {
        //     type: 'Feature',
        //     geometry: JSON.parse(data[0].geomj),
        //     properties: {
        //         infoj: data[0].infoj
        //     }
        // };
        // if (req.query.displayGeom) {
        //     feature.properties['displayGeom'] = JSON.parse(data[0].displaygeom);
        // }

        // if (typeof data[0].infoj === 'string') data[0].infoj = JSON.parse(data[0].infoj);

        console.log(id);

        res.status(200).json();
    })
    .catch(error => {
        console.log(error);
    });
}

module.exports = {
    save: save
};