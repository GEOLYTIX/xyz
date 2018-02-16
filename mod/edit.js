const { Client } = require('pg');
const DBS = {};
Object.keys(process.env).map(function (key) {
    if (key.split('_')[0] === 'DBS') {
        DBS[key.split('_')[1]] = new Client({ connectionString: process.env[key] });
        DBS[key.split('_')[1]].connect();
    }
});

async function newRecord(req, res) {
    try {
        let q =
        `INSERT INTO ${req.body.table} (geom)
            SELECT ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(req.body.geometry)}'), 4326) AS geom
            RETURNING id;`;

        //console.log(q);

        let result = await DBS[req.body.dbs].query(q);

        q =
        `UPDATE ${req.body.table} SET
            ${req.body.qID} = '${req.body.table + '.' + result.rows[0].id}'
            WHERE id = '${result.rows[0].id}';`;

        //console.log(q);

        await DBS[req.body.dbs].query(q);

        res.status(200).send(req.body.table + '.' + result.rows[0].id);

    } catch (err) {
        console.log(err.stack)
    }
}

function updateRecord(req, res) {

    let q =
    `UPDATE ${req.body.table} SET
       geom = ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(req.body.geometry)}'), 4326)
       WHERE ${req.body.qID} = '${req.body.id}';`

    //console.log(q);
             
    DBS[req.body.dbs].query(q)
    .then(result => {
        //console.log(result);
        res.status(200).send();
    })
    .catch(error => {
        console.log(error);
    });
}

function deleteRecord(req, res) {

    let q =
    `DELETE FROM ${req.body.table} where ${req.body.qID} = '${req.body.id}';`;

    //console.log(q);
             
    DBS[req.body.dbs].query(q)
    .then(result => {
        //console.log(result);
        res.status(200).send();
    })
    .catch(error => {
        console.log(error);
    });
}

module.exports = {
    newRecord: newRecord,
    updateRecord: updateRecord,
    deleteRecord: deleteRecord
};