const { Client } = require('pg');
const DBS = {};
Object.keys(process.env).map(function (key) {
    if (key.split('_')[0] === 'DBS') {
        DBS[key.split('_')[1]] = new Client({ connectionString: process.env[key] });
        DBS[key.split('_')[1]].connect();
    }
});

function save(req, res) {

    let q =
    `INSERT INTO ${req.body.table} (geom)
       SELECT ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(req.body.geometry)}'), 4326) AS geom
       RETURNING id;`

    console.log(q);
             
    DBS[req.body.dbs].query(q)
    .then(result => {
        console.log(result);
        res.status(200).json();
    })
    .catch(error => {
        console.log(error);
    });
}

function update(req, res) {

    let q =
    `UPDATE ${req.body.table} SET
       geom = ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(req.body.geometry)}'), 4326)
       WHERE ${req.body.qID} = '${req.body.id}';`

    console.log(q);
             
    DBS[req.body.dbs].query(q)
    .then(result => {
        console.log(result);
        res.status(200).json();
    })
    .catch(error => {
        console.log(error);
    });
}

module.exports = {
    save: save,
    update: update
};