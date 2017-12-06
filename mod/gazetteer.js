const pgp = require('pg-promise')({
    promiseLib: require('bluebird'),
    noWarnings: true});
const db = pgp(process.env.POSTGRES);
const googleMapsClient = require('@google/maps').createClient({
    key: process.env.GKEY
});

function gazetteer(req, res) {
    // let q = "SELECT label, qid id, source FROM gaz_" + req.query.c + " WHERE search LIKE '"
    //     + decodeURIComponent(req.query.q).toUpperCase() + "%' ORDER BY searchindex, search LIMIT 10";

    let q = `SELECT label, qid id, source
               FROM gaz_${req.query.c}
               WHERE search LIKE '${decodeURIComponent(req.query.q).toUpperCase()}%'
               ORDER BY searchindex, search LIMIT 10`;

    //console.log(q);

    db.any(q)
        .then(function (data) {
            if (data.length > 0) {
                res.status(200).json(data);
            } else {
                eval(req.query.p + '_placesAutoComplete')(req, res);
            }
        })
        .catch(()=>google_placesAutoComplete(req, res));
}

const request = require('request');
function mapbox_placesAutoComplete(req, res) {
    let country = req.query.c === 'UK' ? 'GB' : req.query.c;

    let mapbox_query = `https://api.mapbox.com/geocoding/v5/mapbox.places/${req.query.q}.json?country=${country}&access_token=${process.env.MAPBOX}`;

    request.get(mapbox_query, (err, response, body) => {
        if (err) {
            console.log(err);
        } else {
            let data = [],
                jbody = JSON.parse(body);

            for (let i = 0; i < jbody.features.length; i++) {
                data[i] = {
                    label: jbody.features[i].text,
                    id: jbody.features[i].center,
                    source: 'mapbox'
                };
            }
            res.status(200).json(data);
        }
    })
}

function google_placesAutoComplete(req, res) {
    let country = req.query.c === 'UK' ? 'GB' : req.query.c;

    googleMapsClient.placesAutoComplete({
        input: decodeURIComponent(req.query.q),
        components: {
            country: country
        }
    }, function(err, results) {
        if (!err) {
            let data = [];
            let n = results.json.predictions.length;
            for (let i = 0; i < n; i++) {
                data[i] = {
                    label: results.json.predictions[i].description,
                    id: results.json.predictions[i].place_id,
                    source: 'google'
                };
            }
            res.status(200).json(data);
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
