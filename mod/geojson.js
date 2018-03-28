function geojson(req, res) {
    let q =
    `SELECT 
       ${req.query.qID} AS id,
       ${req.query.geomj} AS geomj
     FROM ${req.query.table}
     WHERE
       ST_DWithin(
         ST_MakeEnvelope(
           ${req.query.west},
           ${req.query.south},
           ${req.query.east},
           ${req.query.north},
           4326),
        ${req.query.geom},
        0.000001);`

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