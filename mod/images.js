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

    let data = [],
        feature = req.query.feature.replace(".", "+"),
        //ext = req.query.type.replace("image/", ""),
        ext = 'png';
    ts = Date.now(),
        props = feature.split("+"),
        table = props[0],
        qid = props[1],
        filename = feature + "+" + ts + "." + ext;

    // save image to local drive
    fs.writeFile('public/images/' + filename, req.body, function (err) {
        if (err) throw err;
        console.log(filename + ' saved.');
    });

    let q = `UPDATE ${table} set images = array_append(images, '${filename}') where qid = '${req.query.feature}';`;

    //console.log(q);

    // add filename to images field
    DBS[req.query.dbs].query(q)
        .then(result => {
            res.status(200).send({
                "image": filename
            });
        })
        .catch(err => console.log(err));

    req.on('error', function (err) {
        console.log(err);
    });

}

module.exports = {
    save: save
}