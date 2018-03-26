const { Client } = require('pg');
const DBS = {};
Object.keys(process.env).map(key => {
    if (key.split('_')[0] === 'DBS') {
        DBS[key.split('_')[1]] = new Client({ connectionString: process.env[key] });
        DBS[key.split('_')[1]].connect();
    }
});

function fetch_tiles(req, res) {

    let params = req.url.split('/'),
        x = parseInt(params[3]),
        y = parseInt(params[4]),
        z = parseInt(params[2]),
        m = 20037508.34,
        r = (m*2)/(Math.pow(2,z)),
        tbl = req.query.table;

    DBS[req.query.dbs].query(`SELECT mvt FROM ${tbl}__tc WHERE z = ${z} AND x = ${x} AND y = ${y}`)
        .then(result => {
            res.setHeader('Content-Type', 'application/x-protobuf');
            res.status(200);
            res.send(result.rows[0].mvt);
        })
        .catch(err => {
            console.log(`${z}/${x}/${y} not found in cache`);
            let q = `
            INSERT INTO ${tbl}__tc (z, x, y, mvt, tile)
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
                    ${req.query.qID} AS id,
                    ${req.query.properties ? req.query.properties + ', ' : ' '}
                    ST_AsMVTGeom(
                        ${req.query.geom_3857},
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
                FROM ${tbl}
                WHERE ST_DWithin(ST_MakeEnvelope(
                    ${-m + (x * r)},
                    ${ m - (y * r)},
                    ${-m + (x * r) + r},
                    ${ m - (y * r) - r},
                    3857
                ),${req.query.geom_3857},0)
            ) tile
            RETURNING mvt;
            `;

            //console.log(q);

            DBS[req.query.dbs].query(q)
            .then(result => {
                res.setHeader('Content-Type', 'application/x-protobuf');
                res.status(200);
                res.send(result.rows[0].mvt);
            })
            .catch(err => console.error(err));
        
        });
}

module.exports = {
    fetch_tiles: fetch_tiles
};

// ST_MakeEnvelope() in ST_AsMVT is based on https://github.com/mapbox/postgis-vt-util/blob/master/src/TileBBox.sql
