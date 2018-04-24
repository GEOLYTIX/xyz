async function geojson(req, res) {

    let
        table = req.query.table,
        id = req.query.qID === 'undefined' ? null : req.query.qID,
        geom = req.query.geom === 'undefined' ? 'geom' : req.query.geom,
        west = parseFloat(req.query.west),
        south = parseFloat(req.query.south),
        east = parseFloat(req.query.east),
        north = parseFloat(req.query.north);

    // Check whether string params are found in the settings to prevent SQL injections.
    if (await require('./chk').chkVals([table, id, geom], res).statusCode === 406) return;

    let q = `
    SELECT
        ${id} AS id,
        ST_asGeoJson(${geom}) AS geomj
    FROM ${req.query.table}
    WHERE
        ST_DWithin(
            ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326),
            ${geom}, 0.000001);`

    global.DBS[req.query.dbs].query(q)
        .then(result => {
            res.status(200).json(Object.keys(result.rows).map(row => {
                return {
                    type: 'Feature',
                    geometry: JSON.parse(result.rows[row].geomj),
                    properties: {
                        id: result.rows[row].id
                    }
                }
            }));
        })
        .catch(err => console.log(err));

}

module.exports = {
    geojson: geojson
};