async function geojson(req, res) {

    let
        table = req.query.table,
        id = req.query.qID === 'undefined' ? 'id' : req.query.qID,
        properties = req.query.properties === 'undefined' ? '' : req.query.properties,
        geom = req.query.geom === 'undefined' ? 'geom' : req.query.geom,
        west = parseFloat(req.query.west),
        south = parseFloat(req.query.south),
        east = parseFloat(req.query.east),
        north = parseFloat(req.query.north);

    // Check whether string params are found in the settings to prevent SQL injections.
    if (await require('./chk').chkVals([table, id, geom, properties], res).statusCode === 406) return;

    let q = `
    SELECT
        ${id} AS id,
        ${properties}
        ST_asGeoJson(${geom}) AS geomj
    FROM ${req.query.table}
    WHERE
        ST_DWithin(
            ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326),
            ${geom}, 0.000001);`

    global.DBS[req.query.dbs].query(q)
        .then(result => {
            res.code(200).send(Object.keys(result.rows).map(row => {
                
                let props = {};
                
                Object.keys(result.rows[row]).map(function(key){
                    if(key !== 'geomj'){
                        props[key] = result.rows[row][key];
                    }
                });
                
                return {
                    type: 'Feature',
                    geometry: JSON.parse(result.rows[row].geomj),
                    /*properties: {
                        id: result.rows[row].id
                    }*/
                    properties: props || {
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