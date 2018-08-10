module.exports = { get };

async function get(req, res, fastify) {
    let
        token = fastify.jwt.decode(req.cookies.xyz_token),
        layer = global.workspace[token.access].config.locales[req.query.locale].layers[req.query.layer],
        table = req.query.table,
        geom_3857 = layer.geom_3857 ? layer.geom_3857 : 'geom_3857',
        properties = layer.properties ? layer.properties : '',
        tilecache = layer.tilecache ? layer.tilecache : null,
        id = layer.qID ? layer.qID : null,
        x = parseInt(req.params.x),
        y = parseInt(req.params.y),
        z = parseInt(req.params.z),
        m = 20037508.34,
        r = (m * 2) / (Math.pow(2, z));
    
    // Check whether string params are found in the settings to prevent SQL injections.
    if ([id, table, tilecache, layer, geom_3857, properties]
        .some(val => (typeof val === 'string' && global.workspace[token.access].values.indexOf(val) < 0))) {
        return res.code(406).send('Parameter not acceptable.');
    }
    
    if(properties) properties = `${properties},`;

    if (tilecache) {
        try {
            var db_connection = await fastify.pg[layer.dbs].connect();
            var result = await db_connection.query(`SELECT mvt FROM ${tilecache} WHERE z = ${z} AND x = ${x} AND y = ${y}`);
            db_connection.release();
        } catch(err) {
            console.error(err);
            res.code(500).send("soz. it's not you. it's me.");
        }
    }

    if (result && result.rowCount === 1) {
        res
            .type('application/x-protobuf')
            .code(200)
            .send(result.rows[0].mvt);
        return
    }

    // ST_MakeEnvelope() in ST_AsMVT is based on https://github.com/mapbox/postgis-vt-util/blob/master/src/TileBBox.sql
    var q = `
        ${tilecache ? `INSERT INTO ${tilecache} (z, x, y, mvt, tile)` : ''}
        SELECT
            ${z},
            ${x},
            ${y},
            ST_AsMVT(tile, '${req.query.layer}', 4096, 'geom') mvt,
            ST_MakeEnvelope(
                ${-m + (x * r)},
                ${ m - (y * r)},
                ${-m + (x * r) + r},
                ${ m - (y * r) - r},
                3857
            ) tile
        FROM (
            SELECT
                ${id} id,
                ${properties}
                ST_AsMVTGeom(
                    ${geom_3857},
                    ST_MakeEnvelope(
                        ${-m + (x * r)},
                        ${ m - (y * r)},
                        ${-m + (x * r) + r},
                        ${ m - (y * r) - r},
                        3857
                    ),
                    4096,
                    256,
                    true) geom
            FROM ${table}
            WHERE ST_DWithin(ST_MakeEnvelope(
                ${-m + (x * r)},
                ${ m - (y * r)},
                ${-m + (x * r) + r},
                ${ m - (y * r) - r},
                3857
            ),${geom_3857},0)
        ) tile
        ${tilecache ? 'RETURNING mvt;' : ';'}
        `;

    var db_connection = await fastify.pg[layer.dbs].connect();
    var result = await db_connection.query(q);
    db_connection.release();

    res
        .type('application/x-protobuf')
        .code(200)
        .send(result.rows[0].mvt);
}