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
    //if (await require('./chk').chkVals([table, geom, size, color], res).statusCode === 406) return;

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
                res.code(204).send({});
            } else {
                res
                .code(200).send(Object.keys(result.rows).map(function (record) {
                    return Object.keys(result.rows[record]).map(function (field) {
                        return result.rows[record][field];
                    });
                }));
            }
        })
        .catch(err => console.log(err));
}

module.exports = {
    grid: grid
}