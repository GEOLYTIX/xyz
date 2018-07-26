module.exports = { get };

async function get(req, res, fastify) {

    let
        table = req.query.table,
        id = req.query.qID === 'undefined' ? 'id' : req.query.qID,
        properties = req.query.properties === 'undefined' ? '' : req.query.properties,
        geom = req.query.geom === 'undefined' ? 'geom' : req.query.geom,
        geomj = req.query.geomj === 'undefined' ? `ST_asGeoJson(${geom})` : req.query.geomj,
        west = parseFloat(req.query.west),
        south = parseFloat(req.query.south),
        east = parseFloat(req.query.east),
        north = parseFloat(req.query.north),
        token = fastify.jwt.decode(req.cookies.xyz_token);

    // Check whether string params are found in the settings to prevent SQL injections.
    if ([table, geom, id, properties]
        .some(val => (typeof val === 'string' && global.workspace[token.access].values.indexOf(val) < 0))) {
        return res.code(406).send('Parameter not acceptable.');
    }
    
    if(properties) properties = `${properties},`;

    var q = `
    SELECT
        ${id} AS id,
        ${properties}
        ${geomj} AS geomj
    FROM ${req.query.table}
    WHERE
        ST_DWithin(
            ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326),
            ${geom}, 0.000001);`

    var db_connection = await fastify.pg[req.query.dbs].connect();
    var result = await db_connection.query(q);
    db_connection.release();

    res.code(200).send(Object.keys(result.rows).map(row => {
        let props = {};

        Object.keys(result.rows[row]).map(function (key) {
            if (key !== 'geomj') {
                props[key] = result.rows[row][key];
            }
        });

        return {
            type: 'Feature',
            geometry: JSON.parse(result.rows[row].geomj),
            properties: props || {
                id: result.rows[row].id
            }
        }
    }));
}