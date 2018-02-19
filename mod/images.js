const fs = require('fs');

const { Client } = require('pg');
const DBS = {};
Object.keys(process.env).map(function (key) {
    if (key.split('_')[0] === 'DBS') {
        DBS[key.split('_')[1]] = new Client({ connectionString: process.env[key] });
        DBS[key.split('_')[1]].connect();
    }
});

//const db = pgp(process.env.XYZ);

function save(req, res) {

    req.setEncoding('binary');

    let filename = `${req.query.id.replace('.', '+')}+${Date.now()}.jpg`;

    // save image to local drive
    fs.writeFile(process.env.IMAGES + filename, req.body, function (err) {
        if (err) throw err;
        console.log(filename + ' saved.');
    });

    let q = `UPDATE ${req.query.table} 
                SET images = array_append(images, '${filename}')
                WHERE ${req.query.qID} = '${req.query.id}';`;

    //console.log(q);

    // add filename to images field
    DBS[req.query.dbs].query(q)
        .then(result => {
            res.status(200).send({
                'image': filename
            });
        })
        .catch(err => console.log(err));

    req.on('error', function (err) {
        console.log(err);
    });

}

function remove(req, res) {

    let q = `UPDATE ${req.query.table} 
                SET images = array_remove(images, '${req.query.filename.replace(/ /g, '+')}')
                WHERE ${req.query.qID} = '${req.query.id}';`;

    //console.log(q);

    // add filename to images field
    DBS[req.query.dbs].query(q)
        .then(result => {
            res.status(200).send({
                'image': req.query.filename.replace(/ /g, '+')
            });
        })
        .catch(err => console.log(err));

    req.on('error', function (err) {
        console.log(err);
    });

}

module.exports = {
    save: save,
    remove: remove
}