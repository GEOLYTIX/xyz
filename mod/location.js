const pgp = require('pg-promise')({
    promiseLib: require('bluebird'),
    noWarnings: true});
const db = pgp(process.env.POSTGRES);

function location(req, res) {
    let id = req.query.grid_id.split('.'),
        q = "SELECT geomj g FROM "
            + id[0] + " WHERE "
            + req.query.qid + " = '"
            + req.query.grid_id + "'";
    //console.log(q);

    db.any(q)
        .then(function (cell) {
            q = "SELECT "
                + req.query.qid + " as id, "
                + req.query.label + " as label FROM "
                + req.query.layer + " WHERE "
                + id[0] + ' = '
                + id[1];
            //console.log(q);

            db.any(q)
                .then(function (loc) {
                    res.status(200).json({
                        cell: cell[0].g,
                        loc: loc
                    });
                });
        });
}

function location_info(req, res){
        let q = "SELECT geomj, infoj, "
            + req.query.vector + " as vector FROM "
            + req.query.layer + " WHERE "
            + req.query.qid + " = "
            + req.query.id;
        // console.log(q);

        db.any(q).then(function (data) {
            res.status(200).json(data);
        });
}

module.exports = {
    location: location,
    location_info: location_info
};