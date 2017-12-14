const pgp = require('pg-promise')({
    promiseLib: require('bluebird'),
    noWarnings: true});
const db = pgp(process.env.POSTGRES);
const googleMapsClient = require('@google/maps').createClient({
    key: process.env.GKEY
});

function drivetime (req, res) {
    eval(req.query.provider + '_drivetime')(req, res);
}

function mapbox_grid_drivetime(req, res) {
    let iL = req.query.distance > 2700 ? 0 : 1;
    req.query.arrayGrid = req.query.arrayGrid.split(',');
    req.query.infoj = decodeURIComponent(req.query.infoj);
    drivetime_pg(req, res, {}, iL);
}

function google_grid_drivetime(req, res) {
    let iL = req.query.distance > 2700 ? 0 : 1;
    req.query.arrayGrid = req.query.arrayGrid.split(',');
    req.query.infoj = decodeURIComponent(req.query.infoj);
    drivetime_pg(req, res, {}, iL);
}

function drivetime_pg(req, res, data, iL) {
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
        req.query.provider === 'mapbox_grid' ?
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
    let pg = turf.pointGrid(turf.bbox(convex), 1, {units: 'kilometers'});
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
    let iso = turf.isobands(tag, [0, parseInt(req.query.distance)], {zProperty: 'v'});
    // console.log(JSON.stringify(iso));

    let q = `SELECT
               ${req.query.infoj} infoj,
               ST_AsGeoJSON(
                 ST_Transform(
                   ST_Union(geom),
                   4326
                 )
               ) geom
             FROM
               ${req.query.arrayGrid[iL]}
             WHERE
               ST_DWithin(
                 ST_SetSRID(
                   ST_GeomFromGeoJSON('${JSON.stringify(iso.features[0].geometry)}'),
                   4326
                 ),
                 ${req.query.arrayGrid[iL]}.geomcntr,
                 0
               );`

    // let q = "SELECT "
    //     + req.query.infoj + " infoj, "
    //     + " ST_AsGeoJSON(ST_Transform(ST_Union(geom), 4326)) geom FROM "
    //     + req.query.arrayGrid[iL] + " WHERE ST_DWithin(ST_SetSRID(ST_GeomFromGeoJSON('"
    //     + JSON.stringify(iso.features[0].geometry) + "'), 4326), "
    //     + req.query.arrayGrid[iL] + ".geomcntr, 0);";
    // console.log(q);
    
    let caption = {"Travel time": (parseInt(req.query.distance/60)).toString() + " mins",
                   "Transport mode": req.query.mode};

    db.any(q).then(function (poly) {
        res.status(200).json({
            "geometry": JSON.parse(poly[0].geom),
            //"geometry": iso.features[0].geometry,
            "type": "Feature",
            "properties": Object.assign(caption, poly[0].infoj)
        });
    });
}


function google_drivetime(req, res) {

    // Distance of travel in seconds
    req.query.distance = parseInt(req.query.distance);

    // Each detail level adds 24 sample points to the query
    req.query.detail = parseInt(req.query.detail);

    res.data = {};
    res.data.circlePoints = [];

    for (let i = 1; i <= (req.query.detail * 2); i++) {

        let circle = turf.circle(
            [req.query.lng, req.query.lat],
            (10 * Math.pow(i, 3)) / (10 * Math.pow(req.query.detail * 2, 3)) * (req.query.distance / 30),
            { units: 'kilometers', steps: 12 });

        // Rotate alternate circles
        if (i % 2 === 0) circle = turf.transformRotate(circle, 15, { pivot: [req.query.lng, req.query.lat] });

        res.data.circlePoints = res.data.circlePoints.concat(turf.explode(circle).features.slice(1));
    }

    // Deep clone the circlePoints as samplePoints
    res.data.samplePoints = JSON.parse(JSON.stringify(res.data.circlePoints));

    let destinations = res.data.samplePoints.map(pt => {
        return [parseFloat(pt.geometry.coordinates[0].toFixed(6)),parseFloat(pt.geometry.coordinates[1].toFixed(6))]
    });

    let destinations_ = res.data.samplePoints.map(pt => {
        return [parseFloat(pt.geometry.coordinates[1].toFixed(6)),parseFloat(pt.geometry.coordinates[0].toFixed(6))]
    });

    (function foo(i, destinations) {
        if (i < destinations.length) {
            request(`https://api.mapbox.com/directions-matrix/v1/mapbox/driving/`
                + `${parseFloat(req.query.lng).toFixed(6)},`
                + `${parseFloat(req.query.lat).toFixed(6)};`
                + `${destinations.slice(i, i + 24).join(';')}?`
                + `sources=0`
                + `&destinations=all`
                + `&access_token=${process.env.MAPBOX}`,
                (err, response, body) => {
                    if (err) {
                        console.log(err);
                    } else {


                        console.log(`https://maps.googleapis.com/maps/api/distancematrix/json?`
                            + `units=imperial&`
                            + `origins=${parseFloat(req.query.lat).toFixed(6)},`
                            + `${parseFloat(req.query.lng).toFixed(6)}&`
                            + `destinations=${destinations_.slice(i, i + 24).join('|')}&`
                            + `key=${process.env.GKEY}`);

                        let jbody = JSON.parse(body),
                            start = i,
                            limit = i + 24;

                        for (i; i < limit; i++) {
                            res.data.samplePoints[i].properties = {
                                v: jbody.durations[0][i - start + 1],
                            };
                            res.data.samplePoints[i].geometry.coordinates = jbody.destinations[i - start + 1].location;

                            let displacement = turf.length(
                                turf.lineString([
                                    [res.data.circlePoints[i].geometry.coordinates[0], res.data.circlePoints[i].geometry.coordinates[1]],
                                    [res.data.samplePoints[i].geometry.coordinates[0], res.data.samplePoints[i].geometry.coordinates[1]]
                                ]),
                                { units: 'kilometers' });

                            if (displacement > 1) { res.data.samplePoints[i].properties.wide = true; }
                        }

                        identifyOutliers(res.data.samplePoints.slice(start, start + 12), start);
                        if ((start + 24) < limit) identifyOutliers(res.data.samplePoints.slice(start + 12, start + 24), start + 12);

                        function identifyOutliers(arr, sq_start) {

                            arr_ = arr.filter(pt => {
                                return pt.properties.wide != true;
                            });

                            let avg_v = arr_
                                .map(pt => {
                                    return pt.properties.v
                                })
                                .reduce(function (a, b) { return a + b }) / arr_.length;

                            let avg_d = arr_
                                .map(pt => {
                                    return Math.pow(pt.properties.v - avg_v, pt.properties.v - avg_v);
                                })
                                .reduce(function (a, b) { return a + b }) / arr_.length;

                            let stdDev = Math.sqrt(avg_d);

                            arr.forEach((el, i) => {
                                if (el.properties.v > (avg_v + stdDev)) {
                                    res.data.samplePoints[sq_start + i].properties.outlier = true;
                                }
                            });

                        }

                        foo(i, destinations)
                    }
                })
        } else {
            drivetime_calc(req, res)
        }
    })(0, destinations);
}


function mapbox_drivetime(req, res) {

    // Distance of travel in seconds
    req.query.distance = parseInt(req.query.distance);

    // Each detail level adds 24 sample points to the query
    req.query.detail = parseInt(req.query.detail);

    res.data = {};
    res.data.circlePoints = [];

    for (let i = 1; i <= (req.query.detail * 2); i++) {

        let circle = turf.circle(
            [req.query.lng, req.query.lat],
            (10 * Math.pow(i, 3)) / (10 * Math.pow(req.query.detail * 2, 3)) * (req.query.distance / 30),
            { units: 'kilometers', steps: 12 });

        // Rotate alternate circles
        if (i % 2 === 0) circle = turf.transformRotate(circle, 15, { pivot: [req.query.lng, req.query.lat] });

        res.data.circlePoints = res.data.circlePoints.concat(turf.explode(circle).features.slice(1));
    }

    // Deep clone the circlePoints as samplePoints
    res.data.samplePoints = JSON.parse(JSON.stringify(res.data.circlePoints));

    let destinations = res.data.samplePoints.map(pt => {
        return [parseFloat(pt.geometry.coordinates[0].toFixed(6)), parseFloat(pt.geometry.coordinates[1].toFixed(6))]
    });

    (function foo(i, destinations) {
        if (i < destinations.length) {
            request(`https://api.mapbox.com/directions-matrix/v1/mapbox/driving/`
                + `${parseFloat(req.query.lng).toFixed(6)},`
                + `${parseFloat(req.query.lat).toFixed(6)};`
                + `${destinations.slice(i, i + 24).join(';')}?`
                + `sources=0`
                + `&destinations=all`
                + `&access_token=${process.env.MAPBOX}`,
                (err, response, body) => {
                    if (err) {
                        console.log(err);
                    } else {


                        console.log(`https://api.mapbox.com/directions-matrix/v1/mapbox/driving/`
                            + `${parseFloat(req.query.lng).toFixed(6)},`
                            + `${parseFloat(req.query.lat).toFixed(6)};`
                            + `${destinations.slice(i, i + 24).join(';')}?`
                            + `sources=0`
                            + `&destinations=all`
                            + `&access_token=${process.env.MAPBOX}`);

                        let jbody = JSON.parse(body),
                            start = i,
                            limit = i + 24;

                        for (i; i < limit; i++) {
                            res.data.samplePoints[i].properties = {
                                v: jbody.durations[0][i - start + 1],
                            };
                            res.data.samplePoints[i].geometry.coordinates = jbody.destinations[i - start + 1].location;

                            let displacement = turf.length(
                                turf.lineString([
                                    [res.data.circlePoints[i].geometry.coordinates[0], res.data.circlePoints[i].geometry.coordinates[1]],
                                    [res.data.samplePoints[i].geometry.coordinates[0], res.data.samplePoints[i].geometry.coordinates[1]]
                                ]),
                                { units: 'kilometers' });

                            if (displacement > 1) { res.data.samplePoints[i].properties.wide = true; }
                        }

                        identifyOutliers(res.data.samplePoints.slice(start, start + 12), start);
                        if ((start + 24) < limit) identifyOutliers(res.data.samplePoints.slice(start + 12, start + 24), start + 12);

                        function identifyOutliers(arr, sq_start) {

                            arr_ = arr.filter(pt => {
                                return pt.properties.wide != true;
                            });

                            let avg_v = arr_
                                .map(pt => {
                                    return pt.properties.v
                                })
                                .reduce(function (a, b) { return a + b }) / arr_.length;

                            let avg_d = arr_
                                .map(pt => {
                                    return Math.pow(pt.properties.v - avg_v, pt.properties.v - avg_v);
                                })
                                .reduce(function (a, b) { return a + b }) / arr_.length;

                            let stdDev = Math.sqrt(avg_d);

                            arr.forEach((el, i) => {
                                if (el.properties.v > (avg_v + stdDev)) {
                                    res.data.samplePoints[sq_start + i].properties.outlier = true;
                                }
                            });

                        }

                        foo(i, destinations)
                    }
                })
        } else {
            drivetime_calc(req, res)
        }
    })(0, destinations);
}

function drivetime_calc(req, res) {

    // Filter outlier from samplePoints
    res.data.samplePoints = res.data.samplePoints.filter(pt => {
        return pt.properties.outlier != true;
    });

    // Create a pointgrid on the extent of the tin convex hull
    let pg = turf.pointGrid(
        turf.bbox({
            type: "FeatureCollection",
            features: res.data.samplePoints
        }),
        req.query.distance / 450,
        { units: 'kilometers' });

    // Create TIN
    res.data.tin = turf.tin({
        type: "FeatureCollection",
        features: res.data.samplePoints
    }, 'v');

    // Assign tin feature IDs
    for (let i = 0; i < res.data.tin.features.length; i++) {
        res.data.tin.features[i].properties.id = i;
    }

    // Tag the pointgrid points with the tin id
    let tag = turf.tag(pg, res.data.tin, 'id', 'tin');

    // Assign interpolated drivetime values v from the tin element with matching tag ID
    tag.features.map(pt =>
        pt.properties.v = pt.properties.tin ?
            turf.planepoint(pt, res.data.tin.features[pt.properties.tin]) :
            parseInt(req.query.distance) * 2
    );

    // Create ISO bands on the point grid
    res.data.iso = turf.isobands(tag,
        [
            0,
            parseInt(req.query.distance) * 0.2,
            parseInt(req.query.distance) * 0.4,
            parseInt(req.query.distance) * 0.6,
            parseInt(req.query.distance) * 0.8,
            parseInt(req.query.distance)
        ],
        { zProperty: 'v' });

    // Return json to client
    res.status(200).json({
        properties: {
            "Travel time": (parseInt(req.query.distance / 60)).toString() + " mins",
            "Transport mode": req.query.mode
        },
        iso: res.data.iso,
        tin: res.data.tin,
        circlePoints: res.data.circlePoints,
        samplePoints: res.data.samplePoints
    });
}

module.exports = {
    drivetime: drivetime
};