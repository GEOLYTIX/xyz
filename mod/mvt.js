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
        q =
            `SELECT ST_AsMVT(tile, '${req.query.layer}', 4096, 'geom')
             FROM (
               SELECT
                 ${req.query.qID} AS id,
                 ST_AsMVTGeom(
                    ${req.query.geom_3857},
                   TileBBox(${z},${x},${y}),
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
               ${req.query.filter}
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


/******************************************************************************
https://github.com/mapbox/postgis-vt-util/blob/master/src/TileBBox.sql
### TileBBox ###
Given a Web Mercator tile ID as (z, x, y), returns a bounding-box
geometry of the area covered by that tile.
__Parameters:__
- `integer` z - A tile zoom level.
- `integer` x - A tile x-position.
- `integer` y - A tile y-position.
- `integer` srid - SRID of the desired target projection of the bounding
  box. Defaults to 3857 (Web Mercator).
__Returns:__ `geometry(polygon)`
******************************************************************************/
/*
create or replace function TileBBox (z int, x int, y int, srid int = 3857)
    returns geometry
    language plpgsql immutable as
$func$
declare
    max numeric := 20037508.34;
    res numeric := (max*2)/(2^z);
    bbox geometry;
begin
    bbox := ST_MakeEnvelope(
        -max + (x * res),
        max - (y * res),
        -max + (x * res) + res,
        max - (y * res) - res,
        3857
    );
    if srid = 3857 then
        return bbox;
    else
        return ST_Transform(bbox, srid);
    end if;
end;
$func$;
*/