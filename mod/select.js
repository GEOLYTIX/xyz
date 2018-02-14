let pgp = require('pg-promise')({
    promiseLib: require('bluebird'),
    noWarnings: true
});
const DBS = {};
Object.keys(process.env).map(function (key) {
    if (key.split('_')[0] === 'DBS')
        DBS[key.split('_')[1]] = pgp(process.env[key])
  });

function select(req, res) {

    let q =
    `SELECT
       ${req.query.infoj} AS infoj,
       ${req.query.geomj} AS geomj
       ${req.query.displayGeom}
     FROM ${req.query.table}
     WHERE
       ${req.query.qID} = '${req.query.id}';`

    //console.log(q);
             
    DBS[req.query.dbs].any(q)
        .then(data => {

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

            if (typeof data[0].infoj === 'string') data[0].infoj = JSON.parse(data[0].infoj);

            res.status(200).json(data);
        })
        .catch(error => {
            console.log(error);
        });
}

module.exports = {
    select: select
};