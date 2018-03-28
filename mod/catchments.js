const turf = require('@turf/turf');

function catchments (req, res) {

    // Distance of travel in seconds
    req.query.distance = parseInt(req.query.distance);

    // Each detail level adds 24 sample points to the query
    req.query.detail = parseInt(req.query.detail);

    // Distance in seconds divided by the reach defines the radius for the sample points circle
    req.query.reach = parseInt(req.query.reach);

    // Assign empty data object to the response
    res.data = {};

    // Create empty array for circle (sample) points
    // Generate points from circles generated with TurfJS
    res.data.circlePoints = [];
    for (let i = 1; i <= (req.query.detail * 2); i++) {

        // Create circle on the origin of the catchment
        // Circle radius increase by a logarithmic function for driving
        // Circles are linear distributed for walking
        let circle = turf.circle(
            [req.query.lng, req.query.lat],
            req.query.mode === 'driving' ?
                (10 * Math.pow(i, 3)) / (10 * Math.pow(req.query.detail * 2, 3)) * (req.query.distance / req.query.reach) :
                (req.query.distance / req.query.reach) / (req.query.detail * 2) * i,
            { units: 'kilometers', steps: 12 });

        // Rotate alternate circles
        if (i % 2 === 0) circle = turf.transformRotate(circle, 15, { pivot: [req.query.lng, req.query.lat] });

        // Explode circle into points
        res.data.circlePoints = res.data.circlePoints.concat(turf.explode(circle).features.slice(1));
    }

    // Deep clone the circlePoints as samplePoints
    res.data.samplePoints = JSON.parse(JSON.stringify(res.data.circlePoints));

    // Get destinations for distance matrix requests
    res.data.destinations = eval(req.query.provider + '_destinations')(req, res);

    // Requests need to be split due to a limitation of 24 destinations per call
    (function requestLoop(i) {
        if (i < res.data.destinations.length) {
            
            // Send request to the provider API
            require('request')(eval(req.query.provider + '_request')(req, res, i),
                (err, response, body) => {
                    if (err) {
                        console.log(err);
                    } else {
                        let jbody = JSON.parse(body),
                            start = i,
                            limit = i + 24;

                        // Process the response from the distance matric API
                        for (i; i < limit; i++) {
                            eval(req.query.provider + '_samplePoints')(req, res, jbody, i, start)
                        }

                        // Identify and flag outliers on inner ring
                        identifyOutliers(req, res, res.data.samplePoints.slice(start, start + 12), start);

                        // Do not flag outliers on outermost ring
                        if ((start + 24) < limit) identifyOutliers(req, res, res.data.samplePoints.slice(start + 12, start + 24), start + 12);

                        requestLoop(i)
                    }
                })
        } else {
            catchment_calc(req, res)
        }
    })(0);
}

function identifyOutliers(req, res, arr, sq_start) {

    // Filter sample points with a value greater than 0
    arr_ = arr.filter(pt => {
        return pt.properties.v > 0;
    });

    // Calculate standard deviation for rings with more than 3 valid sample points
    if (arr_.length > 3) {
        let avg_v = arr_
            .map(pt => {
                return pt.properties.v
            })
            .reduce(function (a, b) { return a + b }) / arr_.length;

        let avg_d = arr_
            .map(pt => {
                return Math.pow(pt.properties.v - avg_v, 2);
            })
            .reduce(function (a, b) { return a + b }) / arr_.length;

        let stdDev = Math.sqrt(avg_d);

        // Flag sample points which are above the standard deviation for the current ring
        arr.forEach((el, i) => {
            if (el.properties.v > (avg_v + stdDev)) {
                res.data.samplePoints[sq_start + i].properties.outlier = true;
            }
        });
    }
}

function GOOGLE_destinations(req, res) {
    return res.data.samplePoints.map(pt => {
        return [parseFloat(pt.geometry.coordinates[1].toFixed(6)),parseFloat(pt.geometry.coordinates[0].toFixed(6))]
    })
}

function MAPBOX_destinations(req, res) {
    return res.data.samplePoints.map(pt => {
        return [parseFloat(pt.geometry.coordinates[0].toFixed(6)), parseFloat(pt.geometry.coordinates[1].toFixed(6))]
    })
}

function GOOGLE_request(req, res, i) {
    return `https://maps.googleapis.com/maps/api/distancematrix/json?`
    + `units=imperial&`
    + `mode=${req.query.mode}&`
    + `origins=${parseFloat(req.query.lat).toFixed(6)},`
    + `${parseFloat(req.query.lng).toFixed(6)}`
    + `&destinations=${res.data.destinations.slice(i, i + 24).join('|')}`
    + `&${global.KEYS[req.query.provider]}`
}

function MAPBOX_request(req, res, i) {
    return `https://api.mapbox.com/directions-matrix/v1/mapbox/${req.query.mode}/`
    + `${parseFloat(req.query.lng).toFixed(6)},`
    + `${parseFloat(req.query.lat).toFixed(6)};`
    + `${res.data.destinations.slice(i, i + 24).join(';')}?`
    + `sources=0`
    + `&destinations=all`
    + `&${global.KEYS[req.query.provider]}`
}

function GOOGLE_samplePoints(req, res, jbody, i, start) {
    res.data.samplePoints[i].properties = {
        v: jbody.rows[0].elements[i - start].status === 'OK' ?
            jbody.rows[0].elements[i - start].duration.value :
            null
    };
}

function MAPBOX_samplePoints(req, res, jbody, i, start) {
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

function catchment_calc(req, res) {

    // Filter outlier from samplePoints
    res.data.samplePoints = res.data.samplePoints.filter(pt => {
        return pt.properties.outlier != true;
    });

    // Filter outlier from samplePoints
    res.data.samplePoints = res.data.samplePoints.filter(pt => {
        return pt.properties.v > 0;
    });

    // Create a pointgrid on the extent of the tin convex hull
    let pg = turf.pointGrid(
        turf.bbox({
            type: "FeatureCollection",
            features: res.data.samplePoints
        }),
        req.query.mode === 'driving' ?
            req.query.distance / 450 :
            req.query.distance / 10000,
        { units: 'kilometers' });

    // Create TIN
    res.data.tin = turf.tin({
        type: 'FeatureCollection',
        features: res.data.samplePoints.concat([{
            type: 'Feature',
            geometry: {
                coordinates:
                    [
                        parseFloat(req.query.lng),
                        parseFloat(req.query.lat)
                    ]
            },
            properties: { v: 0 }
        }])
    }, 'v');

    // Assign tin feature IDs
    for (let i = 0; i < res.data.tin.features.length; i++) {
        res.data.tin.features[i].properties.id = i;
    }

    // Tag the pointgrid points with the tin id
    let tag = turf.tag(pg, res.data.tin, 'id', 'tin');

    // Assign interpolated catchment values v from the tin element with matching tag ID
    tag.features.map(pt =>
        pt.properties.v = pt.properties.tin ?
            turf.planepoint(pt, res.data.tin.features[pt.properties.tin]) :
            parseInt(req.query.distance) * 2
    );

    // Create ISO bands on the point grid
    res.data.iso = turf.isobands(tag,
        [
            0,
            parseInt(req.query.distance * 0.33),
            parseInt(req.query.distance * 0.66),
            parseInt(req.query.distance)
        ],
        { zProperty: 'v' });

    res.data.iso.features = res.data.iso.features.filter(f => f.geometry.coordinates.length > 0);

    // Remove holes from Isobands
    res.data.iso.features.map(f => f.geometry.coordinates[0] = [f.geometry.coordinates[0][0]]);

    // Truncate Isoband coordinates
    res.data.iso.features.map(f => f.geometry = turf.truncate(f.geometry, {precision: 5, coordinates: 2}));

    // Change Isoband names
    res.data.iso.features.map(f => f.properties.v = f.properties.v.split('-')[1]);

    // Reverse order of Isobands in array
    res.data.iso.features.reverse();

    // Return json to client
    res.status(200).json({
        properties: {
            "Latitude": `${parseFloat(req.query.lat).toFixed(6)}`,
            "Longitude": `${parseFloat(req.query.lng).toFixed(6)}`,
            "Travel time": `${parseInt(req.query.distance / 60)} mins`,
            "Transport mode": req.query.mode,
            "Provider": req.query.provider
        },
        iso: res.data.iso,
        tin: res.data.tin,
        circlePoints: res.data.circlePoints,
        samplePoints: res.data.samplePoints
    });
}

module.exports = {
    catchments: catchments
};