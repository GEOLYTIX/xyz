async function grid(req, res) {
    
    let
        table = req.query.table,
        geom = req.query.geom,
        size = req.query.size,
        color = req.query.color,
        west = parseFloat(req.query.west),
        south = parseFloat(req.query.south),
        east = parseFloat(req.query.east),
        north = parseFloat(req.query.north);

    // Check whether string params are found in the settings to prevent SQL injections.
    if (await require('./chk').chkVals([table, geom, size, color], res).statusCode === 406) return;

    let q = `
    SELECT
        lon,
        lat,
        ${size} size,
        ${color} color
    FROM ${table}
    WHERE
        ST_DWithin(
            ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326),
            ${geom}, 0.000001)
        AND ${size} >= 1 LIMIT 10000;`

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

async function info(req, res) {

    let
        table = req.body.table,
        geom = req.body.geom,
        fields = '';

    Object.keys(req.body.infoj).map(key => {
        if (req.body.infoj[key].type === 'numeric' || req.body.infoj[key].type === 'integer') fields += `sum(${req.body.infoj[key].fieldfx || req.body.infoj[key].field})::${req.body.infoj[key].type} AS ${req.body.infoj[key].field},`
    });

    // Check whether string params are found in the settings to prevent SQL injections.
    if (await require('./chk').chkVals([table, geom], res).statusCode === 406) return;

    let q = `
    SELECT ${fields} null
    FROM ${table}
    WHERE
        ST_DWithin(
            ST_SetSRID(
                ST_GeomFromGeoJSON('${JSON.stringify(req.body.geometry)}'),
            4326),
        ${geom}, 0);`

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