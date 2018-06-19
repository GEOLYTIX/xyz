function gazetteer(req, res) {

    // let q = `SELECT label, qid id, source
    //            FROM gaz_${req.query.c}
    //            WHERE search LIKE '${decodeURIComponent(req.query.q).toUpperCase()}%'
    //            ORDER BY searchindex, search LIMIT 10`;

    //console.log(q);

    eval(req.query.provider + '_placesAutoComplete')(req, res);

    // global.DBS[req.query.dbs].any(q)
    //     .then(function (data) {
    //         if (data.length > 0) {
    //             res.status(200).json(data);
    //         } else {
    //             eval(req.query.p + '_placesAutoComplete')(req, res);
    //         }
    //     })
    //     .catch(() => eval(req.query.p + '_placesAutoComplete')(req, res));
}

// function gazetteer_places(req, res) {
//     let q = "SELECT geomj FROM "
//             + req.query.id.split('.')[0] + " WHERE qid = '"
//             + req.query.id + "'";
//     //console.log(q);

//     db.any(q).then(function (data) {
//         res.status(200).json(data[0].geomj);
//     });
// }

function MAPBOX_placesAutoComplete(req, res) {

    let q = `https://api.mapbox.com/geocoding/v5/mapbox.places/${req.query.q}.json?`
          + `${req.query.locale ? 'locale=' + req.query.locale : ''}`
          + `${req.query.bounds ? 'bbox=' + req.query.bounds : ''}`
          + `&types=postcode,district,locality,place,neighborhood,address,poi`
          + `&${global.KEYS[req.query.provider]}`;

    //console.log(q);

    require('request').get(q, (err, response, body) => {

        if (err) {
            console.error(err);
            return
        }

        res.code(200).send(JSON.parse(body).features.map(f => {
            return {
                label: `${f.text} (${f.place_type[0]}) ${!req.query.locale && f.context ? ', ' + f.context.slice(-1)[0].text : ''}`,
                id: f.center,
                source: 'mapbox'
            }
        }))
    })
}

function GOOGLE_placesAutoComplete(req, res) {
    let q = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${req.query.q}`
          + `${req.query.locale ? '&components=country:' + req.query.locale : ''}`
          + `${req.query.bounds ? decodeURIComponent(req.query.bounds) : ''}`
          + `&${global.KEYS[req.query.provider]}`;

    require('request').get(q, (err, response, body) => {
        res.code(200).send(JSON.parse(body).predictions.map(f => {
            return {
                label: f.description,
                id: f.place_id,
                source: 'google'
            }
        }))
    })
}

function gazetteer_googleplaces(req, res) {
    let q = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${req.query.id}`
          + `&${global.KEYS.GOOGLE}`;

    require('request').get(q, (err, response, body) => {
        let r = JSON.parse(body).result;
        res.code(200).send({
            type: 'Point',
            coordinates: [r.geometry.location.lng, r.geometry.location.lat]
        })
    })
}

module.exports = {
    gazetteer: gazetteer,
    //gazetteer_places: gazetteer_places,
    gazetteer_googleplaces: gazetteer_googleplaces
};