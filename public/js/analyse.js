const helper = require('./helper');
const svg_marker = require('./svg_marker.js');

module.exports = function Analyse(_this){

    let testA = [
        { "Postal District": "BB10" },
        {
            "Age & Gender": [
                { "Total Population": 36549 },
                {
                    "Gender": [
                        { "Female": 18533 },
                        { "Male": 18015 }
                    ]
                },
                {
                    "Age 16-24": 4047,
                    "Age 25-29": 2329,
                    "Age 30-44": 6940,
                    "Age 45-59": 7026,
                    "Age 60-64": 2592,
                    "Age 65-74": 3478
                }
            ]
        },
        {
            "Ethnicity": [
                { "White British": 28851 },
                { "Non White British": 147 },
                [
                    { "Other White": 401 },
                    { "Black": 36 },
                    { "South Asian": 6034 },
                    { "Chinese": 79 },
                    { "Mixed": 485 },
                    { "Other": 474 }
                ]
            ]
        },
        { "Avg. income@£": 100000 },
        { "Avg. unemployment@%": 10.1 },
        { "Contact": "dennis@gmail.com" },
        { "Notes" : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."}
    ];

    let testB = [
        { "Postal District": "BB10" },
        {
            "Age & Gender": [
                { "Total Population": 36549 },
                {
                    "Gender": [
                        { "Female": 18533 },
                        { "Male": 18015 }
                    ]
                },
                {
                    "Age 16-24": 4047,
                    "Age 25-29": 2329,
                    "Age 30-44": 6940,
                    "Age 45-59": 7026,
                    "Age 60-64": 2592,
                    "Age 65-74": 3478
                }
            ]
        },
        {
            "Ethnicity": [
                { "White British": 28851 },
                { "Non White British": 147 },
                [
                    { "Other White": 401 },
                    { "Black": 36 },
                    { "South Asian": 6034 },
                    { "Chinese": 79 },
                    { "Mixed": 485 },
                    { "Other": 474 }
                ]
            ]
        },
        { "Avg. income@£": 100000 },
        { "Avg. unemployment@%": 10.1 },
        { "Contact": "dennis@gmail.com" },
        { "Notes" : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."}
    ];

    let testC = [
        { "Postal District": "BB10" },
        {
            "Age & Gender": [
                { "Total Population": 36549 },
                {
                    "Gender": [
                        { "Female": 18533 },
                        { "Male": 18015 }
                    ]
                },
                {
                    "Age 16-24": 4047,
                    "Age 25-29": 2329,
                    "Age 30-44": 6940,
                    "Age 45-59": 7026,
                    "Age 60-64": 2592,
                    "Age 65-74": 3478
                }
            ]
        },
        {
            "Ethnicity": [
                { "White British": 28851 },
                { "Non White British": 147 },
                [
                    { "Other White": 401 },
                    { "Black": 36 },
                    { "South Asian": 6034 },
                    { "Chinese": 79 },
                    { "Mixed": 485 },
                    { "Other": 474 }
                ]
            ]
        },
        { "Avg. income@£": 100000 },
        { "Avg. unemployment@%": 10.1 },
        { "Contact": "dennis@gmail.com" },
        { "Notes" : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."}
    ];

    let testData = [testA, testB, testC]

    let colorArray = [
        '#9c27b0', //purple
        '#673ab7', //deep-purple
        '#0d47a1', //indigo
        '#2196f3', //blue
        '#03a9f4', //light-blue
        '#00bcd4', //cyan
        '#009688', //teal
        '#4caf50', //green
        '#8bc34a', //light-green
        '#cddc39', //lime
        '#ffeb3b', //yellow
        '#ffc107', //amber
        '#ff9800', //orange
        '#ff5722', //deep-orange
        '#d32f2f'  //red
    ]

    let dataArray = [
        {
            'letter': 'A',
            'color': '#9c27b0'
        },
        {
            'letter': 'B',
            'color': '#2196f3'
        },
        {
            'letter': 'C',
            'color': '#009688'
        },
        {
            'letter': 'D',
            'color': '#cddc39'
        },
        {
            'letter': 'E',
            'color': '#ff9800'
        },
        {
            'letter': 'F',
            'color': '#673ab7'
        },
        {
            'letter': 'G',
            'color': '#03a9f4'
        },
        {
            'letter': 'H',
            'color': '#4caf50'
        },
        {
            'letter': 'I',
            'color': '#ffeb3b'
        },
        {
            'letter': 'J',
            'color': '#ff5722'
        },
        {
            'letter': 'K',
            'color': '#0d47a1'
        },
        {
            'letter': 'L',
            'color': '#00bcd4'
        },
        {
            'letter': 'M',
            'color': '#8bc34a'
        },
        {
            'letter': 'N',
            'color': '#ffc107'
        },
        {
            'letter': 'O',
            'color': '#d32f2f'
        }
    ];

_this.map.on('click', function(e){

    let space = dataArray.filter(function(obj){

        if (!obj.infoj) return obj

    });

if (space.length > 0){

//console.log(space[0].color);

//console.log('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.floor(Math.random() * Math.floor(26))));

//console.log(colorArray[Math.floor(Math.random() * Math.floor(15))]);

    space[0].infoj = testA;

    createInfojTable(space[0].infoj, space[0].letter, space[0].color);

    space[0].geomj = L.geoJson({
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [e.latlng.lng, e.latlng.lat]
        }
    }, {
            interactive: false,
            pointToLayer: function (feature, latlng) {
                return new L.Marker(latlng, {
                    icon: L.icon({
                        iconUrl: svg_marker(space[0].letter, space[0].color),
                        iconSize: [40, 40],
                        iconAnchor: [20, 40]
                    }),
                    interactive: false
                });
            }
        }).addTo(_this.map);


}

    


});

    let dom = {};
    dom.container = document.querySelector('#analyse_module > .swipe_container');
    dom.table = document.querySelector('#analyse_module .infoj');
    dom.pages = document.querySelectorAll('#analyse_module .page_content');

    // createInfojTable(testA, 'purple', colorArray[0]);
    // createInfojTable(testA, 'deep-purple', colorArray[1]);
    // createInfojTable(testA, 'indigo', colorArray[2]);
    // createInfojTable(testA, 'blue', colorArray[3]);
    // createInfojTable(testA, 'light-blue', colorArray[4]);
    // createInfojTable(testA, 'cyan', colorArray[5]);
    // createInfojTable(testA, 'teal', colorArray[6]);
    // createInfojTable(testA, 'green', colorArray[7]);
    // createInfojTable(testA, 'light-green', colorArray[8]);
    // createInfojTable(testA, 'lime', colorArray[9]);
    // createInfojTable(testA, 'yellow', colorArray[10]);
    // createInfojTable(testA, 'amber', colorArray[11]);
    // createInfojTable(testA, 'orange', colorArray[12]);
    // createInfojTable(testA, 'deep-orange', colorArray[13]);
    // createInfojTable(testA, 'red', colorArray[14]);

    // createInfojTable(testA, 'purple', colorArray[0]);
    // createInfojTable(testA, 'blue', colorArray[3]);
    // createInfojTable(testA, 'teal', colorArray[6]);
    // createInfojTable(testA, 'lime', colorArray[9]);
    // createInfojTable(testA, 'orange', colorArray[12]);

    // createInfojTable(testA, 'deep-purple', colorArray[1]);
    // createInfojTable(testA, 'light-blue', colorArray[4]);
    // createInfojTable(testA, 'green', colorArray[7]);
    // createInfojTable(testA, 'yellow', colorArray[10]);
    // createInfojTable(testA, 'deep-orange', colorArray[13]);

    // createInfojTable(testA, 'indigo', colorArray[2]);
    // createInfojTable(testA, 'cyan', colorArray[5]);
    // createInfojTable(testA, 'light-green', colorArray[8]);
    // createInfojTable(testA, 'amber', colorArray[11]);
    // createInfojTable(testA, 'red', colorArray[14]);

    let comparisonTable = {};

    let result = [];

        // for (let [inputIndex, inputObj] of input.entries()) {
        //     for (let [arrayIndex, arrayObj] of inputObj.entries()) {

        //         if (result.length = 0) {
        //             copy(arrayObj, result[0] = {})
        //         } else {
        //             copy(arrayObj, result[arrayIndex] || (result[arrayIndex] = {}));
        //         }

        //         function copy(obj, res) {
        //             for (let [key, value] of Object.entries(obj)) {
        //                 if (typeof value === "object") {
        //                     if (value.length > 0) {
        //                         copy(value, res[key] || (res[key] = []));
        //                     } else {
        //                         copy(value, res[key] || (res[key] = {}));
        //                     }
        //                 } else if (!isNaN(value)) {
        //                     if (!res[key]) res[key] = [];
        //                     res[key][inputIndex] = value;
        //                 }
        //             }
        //         }

        //     }
        // }


    function createInfojTable(infoj, node, borderColor) {

        let container = document.createElement('div');
        container.className = 'infojContainer';

        let div = document.createElement('div');
        div.textContent = node;
        div.className = 'infojHeader';

        let i = document.createElement('i');
        i.textContent = 'clear';
        i.style.color = borderColor;
        i.className = 'material-icons cursor infojBtn';
        div.appendChild(i);

        i = document.createElement('i');
        i.textContent = 'search';
        i.style.color = borderColor;
        i.className = 'material-icons cursor infojBtn';
        div.appendChild(i);
        
        i = document.createElement('i');
        i.textContent = 'expand_more';
        i.style.color = borderColor;
        i.className = 'material-icons cursor infojBtn';
        div.appendChild(i);

        dom.pages[1].appendChild(div);

        div.addEventListener('click', function(){

            if (this.parentNode.style.maxHeight != (this.clientHeight + 5) + 'px') {
                this.parentNode.style.maxHeight = (this.clientHeight + 5) + 'px';
                this.style.boxShadow = '0 7px 6px -4px black';
            } else {
                this.parentNode.style.maxHeight = (this.parentNode.children[1].clientHeight + this.clientHeight + 5) + 'px';
                this.style.boxShadow = '';
            }

        });



        let table = document.createElement('table');
        table.className="infojTable";
        table.style.borderTop = '3px solid ' + borderColor;
        table.style.borderBottom = '1px solid ' + borderColor;
        table.cellpadding="0";
        table.cellspacing="0";

        let tr = document.createElement('tr');  
        let td = document.createElement('td');
        let tn = document.createTextNode(node);

        container.appendChild(div);
        container.appendChild(table);

        dom.pages[1].appendChild(container);

        infoj.map(function (row) {

            fDec(0, 'key', row);

            function fDec(lv, attribute, row){
                typeof row === 'object' && row.length > 0 ?
                    fArr(lv, row) : typeof row === 'object' ?
                        fObj(lv, row) : fPrt(lv, attribute, row);
            }

            function fPrt(lv, attribute, val){
                td = document.createElement('td');
                td.className = 'col-a ' + (attribute === 'key' ? 'lv-' + lv : attribute);
                tn = document.createTextNode(val);
                td.appendChild(tn);

                if (isNaN(val)){
                    tr = document.createElement('tr');
                    td.colSpan = attribute === 'key' ? '1' : '2';
                    tr.appendChild(td);
                    table.appendChild(tr);
                } else {
                    tr.appendChild(td);
                }
            }

            function fArr(lv, arr){
                arr.map(function (arr) {
                    fDec(lv + 1, 'key', arr);
                })
            }

            function fObj(lv, obj){
                Object.keys(obj).map(function (key) {
                    fPrt(lv, 'key', key);
                    fDec(lv, 'val', obj[key]);
                });
            }
        });
    }

    // function compareInfojTable(infojArr) {

    //     infojArr[0].map(function (row) {

    //         fDec(0, 'key', row, comparisonTable);

    //         function fDec(lv, attribute, row, parent){
    //             if (typeof row === 'object' && row.length > 0) {
    //                 fArr(lv, row, parent);
    //             } else if (typeof row === 'object') {
    //                 fObj(lv, row, parent);
    //             } else {
    //                 parent[row] = {};
    //             }
    //         }

    //         function fArr(lv, arr, parent){
    //             arr.map(function (arr) {
    //                 let k = Object.keys(arr)[0];
    //                 parent[k] = {};
    //                 fDec(lv + 1, 'key', arr, parent[k]);
    //             })
    //         }

    //         function fObj(lv, obj, parent){
    //             Object.keys(obj).map(function (key) {

    //                 if (typeof obj[key] === 'number') {
    //                     parent[key] = obj[key];
                        
    //                 } else {
    //                     parent[key] = {};
    //                     fDec(lv, 'val', obj[key], parent[key]);
    //                 }   
    //             });
    //         }
    //     });
    // }

    // function findCompareKVP(infoj, searchKey, compareValue){
    //     infoj.map(function (row) {

    //         fDec(0, 'key', row);

    //         function fDec(lv, attribute, row){
    //                     if (typeof row === 'object' && row.length > 0) {
    //                         fArr(lv, row);
    //                     } else if (typeof row === 'object') {
    //                         fObj(lv, row);
    //                     }
    //         }

    //         function fArr(lv, arr){
    //             arr.map(function (arr) {
    //                 fDec(lv + 1, 'key', arr);
    //             })
    //         }

    //         function fObj(lv, obj){
    //             Object.keys(obj).map(function (key) {
    //                 if (typeof obj[key] === 'number' && key === searchKey) {

    //                     let o = {};
    //                     o[key] = [compareValue, obj[key]];

    //                     comparisonTable.push(o);
    //                 } else {
    //                     fDec(lv, 'val', obj[key]);
    //                 }       
    //             });
    //         }
    //     })
    // }



    dom.container.style['marginLeft'] = '-50%';

    _this.analyse = {};
    _this.analyse.fromGeoJSON = function(feature){
        let xhr = new XMLHttpRequest();
        xhr.open('POST', 'q_grid_info');
        xhr.setRequestHeader("Content-Type","application/json");
        xhr.onload = function(){
            if(this.status === 200) console.log(this.response);

        }
        xhr.send(JSON.stringify({
            infoj: _this.countries[_this.country].grid.infoj,
            database: _this.countries[_this.country].grid.database,
            geometry: feature.geometry
        }));
    }

}