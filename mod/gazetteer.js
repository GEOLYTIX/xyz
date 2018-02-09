let pgp = require('pg-promise')({
    promiseLib: require('bluebird'),
    noWarnings: true
});
const DBS = {};
Object.keys(process.env).map(function (key) {
    if (key.split('.')[0] === 'DBS')
        DBS[key.split('.')[1]] = pgp(process.env[key])
});

const googleMapsClient = require('@google/maps').createClient({
    key: process.env.GKEY
});

function gazetteer(req, res) {

    let q = `SELECT label, qid id, source
               FROM gaz_${req.query.c}
               WHERE search LIKE '${decodeURIComponent(req.query.q).toUpperCase()}%'
               ORDER BY searchindex, search LIMIT 10`;

    //console.log(q);

    eval(req.query.p + '_placesAutoComplete')(req, res);

    // DBS[req.query.dbs].any(q)
    //     .then(function (data) {
    //         if (data.length > 0) {
    //             res.status(200).json(data);
    //         } else {
    //             eval(req.query.p + '_placesAutoComplete')(req, res);
    //         }
    //     })
    //     .catch(() => eval(req.query.p + '_placesAutoComplete')(req, res));
}

const request = require('request');
function mapbox_placesAutoComplete(req, res) {
    let country = req.query.c === 'UK' ? 'GB' : req.query.c === 'Global' ? '' : req.query.c;
    let mapbox_query = `https://api.mapbox.com/geocoding/v5/mapbox.places/${req.query.q}.json?`
                      +`country=${country}`
                      +`&types=region,postcode,district,place,locality,neighborhood,address,poi`
                      +`&access_token=${process.env.MAPBOX}`;

    request.get(mapbox_query, (err, response, body) => {
        if (err) {
            console.log(err);
        } else {
            //let jbody = JSON.parse(body);

            res.status(200).json(JSON.parse(body).features.map(f => {
                return {
                    label: `${f.text} ${country === '' ? ', ' + f.context.slice(-1)[0].text : ''}`,
                    id: f.center,
                    source: 'mapbox'
                }
            }));
        }
    })
}

function google_placesAutoComplete(req, res) {
    googleMapsClient.placesAutoComplete({
        input: decodeURIComponent(req.query.q),
        components: req.query.c === 'UK' ? { country: 'GB' } : req.query.c === 'Global' ? {} : { country: req.query.c }
    }, (err, results) => {
        if (err) {
            console.log(err);
        } else {
            res.status(200).json(results.json.predictions.map(f => {
                return {
                    label: f.description,
                    id: f.place_id,
                    source: 'google'
                }
            }));
        }
    });
}

function gazetteer_places(req, res) {
    let q = "SELECT geomj FROM "
            + req.query.id.split('.')[0] + " WHERE qid = '"
            + req.query.id + "'";
    //console.log(q);

    db.any(q).then(function (data) {
        res.status(200).json(data[0].geomj);
    });
}

function gazetteer_mapboxplaces(req, res) {
    googleMapsClient.place({
        placeid: req.query.id
    }, function(err, results) {
        if (!err) {
            res.status(200).json({
                "type": "Point",
                "coordinates": [results.json.result.geometry.location.lng, results.json.result.geometry.location.lat]
            });
        }
    });
}

function gazetteer_googleplaces(req, res) {
    googleMapsClient.place({
        placeid: req.query.id
    }, function(err, results) {
        if (!err) {
            res.status(200).json({
                "type": "Point",
                "coordinates": [results.json.result.geometry.location.lng, results.json.result.geometry.location.lat]
            });
        }
    });
}

module.exports = {
    gazetteer: gazetteer,
    gazetteer_places: gazetteer_places,
    gazetteer_mapboxplaces: gazetteer_mapboxplaces,
    gazetteer_googleplaces: gazetteer_googleplaces
};
