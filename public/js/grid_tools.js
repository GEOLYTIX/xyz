const helper = require('./helper');

module.exports = (function () {

    function processGrid(module, data){
        let avg_c = 0,
            avg_v = 0,
            dots = {
                type: "FeatureCollection",
                features: []
            };

        data.map(function(record){

            // lat = record[0]
            // lon = record[1]
            // id = record[2]
            // count = record[3]
            // value = record[4]

            if (parseFloat(record[3]) > 0) {

                record[3] = isNaN(record[3]) ? record[3] : parseFloat(record[3]);
                record[4] = isNaN(record[4]) ? record[4] : parseFloat(record[4]);

                // Make the value [4]
                if (module.calcRatio === true && record[4] > 0) record[4] /= record[3]

                avg_c += parseFloat(record[3]);
                avg_v += isNaN(record[4]) ? 0 : parseFloat(record[4]);

                dots.features.push({
                    "geometry": {
                        "type": "Point",
                        "coordinates": [record[0],record[1]]
                    },
                    "type": "Feature",
                    "properties": {
                        "c": parseFloat(record[3]),
                        "v": isNaN(record[4]) ? record[4] : parseFloat(record[4]),
                        "id": record[2] || null
                    }
                });
            }
        });

        let min = getMath(data, 3, 'min'),
            max = getMath(data, 3, 'max'),
            avg = avg_c / dots.features.length,
            step_lower = (avg - min) / 5,
            step_upper = (max - avg) / 4;

        module.arraySize = [];
        module.arraySize[0] = min;
        module.arraySize[1] = min + step_lower;
        module.arraySize[2] = min + (step_lower * 2);
        module.arraySize[3] = min + (step_lower * 3);
        module.arraySize[4] = min + (step_lower * 4);
        module.arraySize[5] = avg;
        module.arraySize[6] = avg + step_upper;
        module.arraySize[7] = avg + (step_upper * 2);
        module.arraySize[8] = avg + (step_upper * 3);
        module.arraySize[9] = max;

        if (avg_v > 0) {
            // if (module.drivetime.tin) {
            //     dots = turfTag(dots, _this.drivetime.tin, 'i', 'tin');
            //     let id_arr = [];
            //     for (let i = 0; i < dots.features.length; i++) {
            //         dots.features[i].properties.tin ?
            //             dots.features[i].properties.v = turfPlanePoint(dots.features[i], _this.drivetime.tin.features[dots.features[i].properties.tin]) :
            //             dots.features[i].properties.v = _this.drivetime.tinDistance[9] + 1;
            //
            //         if (dots.features[i].properties.v <= _this.drivetime.tinDistance[9]){
            //             id_arr.push(dots.features[i].properties.id);
            //         }
            //     }
            //
            //     getIso(id_arr);
            //
            //     _this.layers[pane].arrayColor = _this.drivetime.tinDistance;
            //     document.getElementById('colourTitle').innerHTML = 'Drivetime in minutes';
            //
            // } else {

            min = getMath(data, 4, 'min');
            max = getMath(data, 4, 'max');
            avg = avg_v / dots.features.length;
            step_lower = (avg - min) / 5;
            step_upper = (max - avg) / 4;
            module.arrayColor = [];
            module.arrayColor[0] = min;
            module.arrayColor[1] = min + step_lower;
            module.arrayColor[2] = min + (step_lower * 2);
            module.arrayColor[3] = min + (step_lower * 3);
            module.arrayColor[4] = min + (step_lower * 4);
            module.arrayColor[5] = avg;
            module.arrayColor[6] = avg + step_upper;
            module.arrayColor[7] = avg + (step_upper * 2);
            module.arrayColor[8] = avg + (step_upper * 3);
            module.arrayColor[9] = max;
        }
        return dots
    }

    function getMath(_arr, _key, _type){
        return Math[_type].apply(null, _arr.map(function (val) {
            return val[_key];
        }))
    }

    return {
        processGrid:processGrid,
    };
})();