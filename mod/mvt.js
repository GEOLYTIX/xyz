async function fetchTiles(req, res) {
    try {

        let
            params = req.url.split('/'),
            x = parseInt(params[3]),
            y = parseInt(params[4]),
            z = parseInt(params[2]),
            m = 20037508.34,
            r = (m * 2) / (Math.pow(2, z)),
            table = req.query.table,
            layer = req.query.layer,
            geom_3857 = req.query.geom_3857,
            id = req.query.qID === 'undefined' ? null : req.query.qID,
            properties = req.query.properties === 'undefined' ? '' : req.query.properties,
            tilecache = req.query.tilecache === 'undefined' ? false : req.query.tilecache,
            result;

        if (await require('./chk').chkVals([table, tilecache, layer, geom_3857, properties], res).statusCode === 406) return;

        if (tilecache) result = await global.DBS[req.query.dbs].query(`SELECT mvt FROM ${tilecache} WHERE z = ${z} AND x = ${x} AND y = ${y}`)
        
        if (result && result.rowCount === 1) {
            res.setHeader('Content-Type', 'application/x-protobuf');
            res.status(200);
            res.send(result.rows[0].mvt);
            return
        }

        // ST_MakeEnvelope() in ST_AsMVT is based on https://github.com/mapbox/postgis-vt-util/blob/master/src/TileBBox.sql
        let q = `
        ${tilecache ? `INSERT INTO ${tilecache} (z, x, y, mvt, tile)` : ''}
        SELECT
            ${z},
            ${x},
            ${y},
            ST_AsMVT(tile, '${layer}', 4096, 'geom') mvt,
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
            ),${req.query.geom_3857},0)
        ) tile
        ${tilecache ? 'RETURNING mvt;' : ';'}
        `;

        result = await global.DBS[req.query.dbs].query(q);

        res.setHeader('Content-Type', 'application/x-protobuf');
        res.status(200);
        res.send(result.rows[0].mvt);

    } catch (err) {
        console.error(err)
    }
}

module.exports = {
    fetchTiles: fetchTiles
};