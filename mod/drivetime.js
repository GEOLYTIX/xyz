const pgp = require('pg-promise')({
    promiseLib: require('bluebird'),
    noWarnings: true});
const db = pgp(process.env.POSTGRES);
const googleMapsClient = require('@google/maps').createClient({
    key: process.env.GKEY
});

//let hxLayers = ['gb_hx_128k', 'gb_hx_64k', 'gb_hx_32k', 'gb_hx_16k', 'gb_hx_8k', 'gb_hx_4k', 'gb_hx_2k'];

function drivetime(req, res) {
    let iL = req.query.distance > 2700 ? 0 : 1;
    req.query.arrayGrid = req.query.arrayGrid.split(',');
    req.query.infoj = decodeURIComponent(req.query.infoj);
    drivetime_pg(req, res, {}, iL);
}

function drivetime_pg (req, res, data, iL) {
    let q = "SELECT lat, lon FROM "
        + req.query.arrayGrid[iL] + " WHERE ST_DWithin(ST_SetSRID(ST_MakePoint("
        + req.query.lng + ","
        + req.query.lat + "),4326), "
        + req.query.arrayGrid[iL] + ".geomcntr, "
        + (8 - iL) + ") AND xcl IS FALSE ORDER BY geomcntr <-> ST_SetSRID(ST_MakePoint("
        + req.query.lng + ","
        + req.query.lat + "),4326) LIMIT 24";
    // console.log(q);

    db.any(q).then(function (pdata) {
        data.current = pdata;
        req.query.provider === 'mapbox' ?
            drivetime_mapbox(req, res, data, iL) :
            drivetime_google(req, res, data, iL);
    });
}

function drivetime_google(req, res, data, iL) {
    let destinations = data.current.map(function (r) {
            return r.lat + ',' + r.lon;
        }).join('|'),
        d = new Date(), //current date
        dd = (Date.now() / 1000) + ((8 - d.getDay()) * 24 * 3600) + ((10 - d.getHours()) * 3600) - (d.getMinutes() * 60); //date time for the next Monday 10am.

    googleMapsClient.distanceMatrix({
        origins: req.query.lat + ',' + req.query.lng,
        destinations: destinations,
        mode: req.query.mode,
        arrival_time: dd
    }, function (err, gdata) {
        if (!err) {
            for (let i = 0; i < data.current.length; i++) {
                gdata.json.rows[0].elements[i].status === 'OK' ?
                    data.current[i].v = gdata.json.rows[0].elements[i].duration.value :
                    data.current[i].v = null;
            }

            drivetime_chk(req, res, data, iL);
        }
    });
}

const request = require('request');
function drivetime_mapbox(req, res, data, iL) {
    let destinations = data.current.map(function (r) {
            return r.lon.toFixed(6) + ',' + r.lat.toFixed(6);
        }).join(';');

    let mapbox_query = `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${parseFloat(req.query.lng).toFixed(6)},${parseFloat(req.query.lat).toFixed(6)};${destinations}?sources=0&destinations=all&access_token=pk.eyJ1IjoiZGJhdXN6dXMiLCJhIjoiY2phM3pzeWEyNm5ocTMzcGh2cXFyd3JpdCJ9.4kuadm-nxD12UFi4ma4yDQ`;

    request(mapbox_query, function(err, response, body){
        if (!err) {
            let jbody = JSON.parse(body);
            for (let i = 1; i < jbody.durations[0].length; i++) {
                    data.current[i-1].v = jbody.durations[0][i];
            }

            drivetime_chk(req, res, data, iL);
        }
    })
}

function drivetime_chk(req, res, data, iL){
    data.full = typeof data.full === 'undefined' ?
        data.current : data.full.concat(data.current);

    iL++;

    data.full.length >= 96 ?
        drivetime_return(req, res, data, iL) :
        drivetime_pg(req, res, data, iL);
}

const turf = require('@turf/turf');

function drivetime_return(req, res, data, iL) {

    data.full = data.full.filter(function(cell){
        return cell.v > 0 && cell.v < parseInt(req.query.distance) * 1.5;
    });

    let points = {
        type: "FeatureCollection",
        features: []
    };

    data.full.map(f => points.features.push({
        "geometry": {
            "type": "Point",
            "coordinates": [f.lon, f.lat]
        },
        "type": "Feature",
        "properties": {
            v: JSON.parse(f.v)
        }
    }));
    // console.log(JSON.stringify(points));

    // create a tin from the points
    let tin = turf.tin(points, 'v');
    // console.log(JSON.stringify(tin));

    // assign IDs to the tin features
    for (let i = 0; i < tin.features.length; i++) {
        tin.features[i].properties.i = i;
    }

    // create a convex hull of the tin features
    let convex = turf.convex(points);
    // console.log(JSON.stringify(convex));

    // create a pointgrid on the extent of the tin convex hull
    let pg = turf.pointGrid(convex, 1, 'kilometers', true, false);
    // console.log(JSON.stringify(pg));

    // tag the pointgrid points with the tin id
    let tag = turf.tag(pg, tin, 'i', 'tin');
    // console.log(JSON.stringify(tag));

    // use planepoint to assign values to the pointgrid points that fall on tin features
    // tag.features.map(function(f){
    //     f.properties.v = f.properties.tin?
    //         turfPlanePoint(f, tin.features[f.properties.tin]) :
    //         data.distance * 1.5;
    // });

    // array map with arrow function - lit!
    tag.features.map(f => f.properties.v = f.properties.tin ?
            turf.planepoint(f, tin.features[f.properties.tin]) :
            parseInt(req.query.distance) * 1.5);
    // console.log(JSON.stringify(tag));



    //let iso = turf.isobands(tag, [0, parseInt(req.query.distance) * 0.33, parseInt(req.query.distance) * 0.66, parseInt(req.query.distance)], 'v');
    let iso = turf.isobands(tag, [0, parseInt(req.query.distance)], 'v');
    // console.log(JSON.stringify(iso));

    // let combine = turf.combine(iso);
    // console.log(JSON.stringify(combine));

    let q = "SELECT "
        + req.query.infoj + " infoj, "
        + " ST_AsGeoJSON(ST_Transform(ST_Union(geom), 4326)) geom FROM "
        + req.query.arrayGrid[iL] + " WHERE ST_DWithin(ST_SetSRID(ST_GeomFromGeoJSON('"
        + JSON.stringify(iso.features[0].geometry) + "'), 4326), "
        + req.query.arrayGrid[iL] + ".geomcntr, 0);";
    // console.log(q);
    
    let caption = {"Travel time": (parseInt(req.query.distance/60)).toString() + " mins",
                   "Transport mode": req.query.mode
                  };

    db.any(q).then(function (poly) {
        res.status(200).json({
            "geometry": JSON.parse(poly[0].geom),
            "type": "Feature",
            "properties": Object.assign(caption, poly[0].infoj)
        });
    });
}

module.exports = {
    drivetime: drivetime
};