function grid(req, res) {
    let q = `SELECT
               lon,
               lat,
               ${req.query.size} size,
               ${req.query.color} color
             FROM ${req.query.table}
             WHERE ST_DWithin(
                     ST_MakeEnvelope(
                       ${req.query.west},
                       ${req.query.south},
                       ${req.query.east},
                       ${req.query.north},
                       4326),
                       ${req.query.geom}, 0)
               AND ${req.query.size} >= 1 LIMIT 10000;`

    //console.log(q);

    global.DBS[req.query.dbs].query(q)
        .then(result => {
            if (result.rows.length === 0) {
                res.status(204).json({});
            } else {
                res.status(200).json(Object.keys(result.rows).map(function (record) {
                    return Object.keys(result.rows[record]).map(function (field) {
                        return result.rows[record][field];
                    });
                }));
            }
        })
        .catch(err => console.log(err));
}

function info(req, res) {

    let fields = '';
    Object.keys(req.body.infoj).map(key => {
        if (req.body.infoj[key].type === 'numeric' || req.body.infoj[key].type === 'integer') fields += `sum(${req.body.infoj[key].fieldfx || req.body.infoj[key].field})::${req.body.infoj[key].type} AS ${req.body.infoj[key].field},`
    });

    let q =
        `SELECT
           ${fields} null
             FROM ${req.body.table}
             WHERE
               ST_DWithin(
                 ST_SetSRID(
                   ST_GeomFromGeoJSON('${JSON.stringify(req.body.geometry)}'),
                   4326),
                   ${req.body.geom}, 0);`

    //console.log(q);

    global.DBS[req.body.dbs].query(q)
        .then(result => {
            if (result.rows.length === 0) {
                res.status(204).json({});

            } else {
                Object.keys(req.body.infoj).map(key => {
                    if (result.rows[0][req.body.infoj[key].field]) {
                        req.body.infoj[key].value = result.rows[0][req.body.infoj[key].field];
                    }
                });
    
                res.status(200).json({
                    geomj: result.rows[0].geomj,
                    infoj: req.body.infoj
                });
            }
        })
        .catch(err => console.log(err));
}

module.exports = {
    grid: grid,
    info: info
}