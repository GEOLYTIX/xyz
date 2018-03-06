const { Client } = require('pg');
const DBS = {};
Object.keys(process.env).map(function (key) {
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
        q =
            `SELECT ST_AsMVT(tile, '${req.query.layer}', 4096, 'geom')
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
               FROM ${req.query.table}
               WHERE ST_Intersects(
                      ${req.query.geom},
                      ST_MakeEnvelope(
                        ${req.query.west},
                        ${req.query.north},
                        ${req.query.east},
                        ${req.query.south},
                        4326))
               ${req.query.filter ? `AND ${req.query.properties} NOT IN ('${req.query.filter.replace(/,/g,"','")}')` : ``}
               ) tile;`;

    //console.log(q);

    DBS[req.query.dbs].query(q)
        .then(result => {
            res.setHeader('Content-Type', 'application/x-protobuf');
            res.status(200);
            res.send(result.rows[0].st_asmvt);
        })
        .catch(err => console.log(err));
}

module.exports = {
    fetch_tiles: fetch_tiles
};

// ST_MakeEnvelope() in ST_AsMVT is based on https://github.com/mapbox/postgis-vt-util/blob/master/src/TileBBox.sql
