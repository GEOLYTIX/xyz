module.exports = { get };

async function get(req, res, fastify) {

    let
        table = req.query.table,
        geom = req.query.geom === 'undefined' ? 'geom' : req.query.geom,
        size = req.query.size,
        color = req.query.color,
        west = parseFloat(req.query.west),
        south = parseFloat(req.query.south),
        east = parseFloat(req.query.east),
        north = parseFloat(req.query.north),
        user = fastify.jwt.decode(req.cookies.xyz_user);

    // Check whether string params are found in the settings to prevent SQL injections.
    if ([table, geom, size, color]
        .some(val => (typeof val === 'string' && global.workspace[user.access].values.indexOf(val) < 0))) {
        return res.code(406).send('Parameter not acceptable.');
    }

    var q = `
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
        AND ${size} >= 1 LIMIT 10000;`;

    var db_connection = await fastify.pg[req.query.dbs].connect();
    var result = await db_connection.query(q);
    db_connection.release();

    if (result.rows.length === 0) return res.code(204).send();

    res.code(200).send(Object.keys(result.rows).map(function (record) {
        return Object.keys(result.rows[record]).map(function (field) {
            return result.rows[record][field];
        });
    }));
}