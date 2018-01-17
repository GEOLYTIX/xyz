const helper = require('./helper');
const svg_marker = require('./svg_marker.js');

module.exports = function Analyse(_this){

    let testData = [
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

    // let colorArray = [
    //     '#9c27b0', //purple
    //     '#673ab7', //deep-purple
    //     '#0d47a1', //indigo
    //     '#2196f3', //blue
    //     '#03a9f4', //light-blue
    //     '#00bcd4', //cyan
    //     '#009688', //teal
    //     '#4caf50', //green
    //     '#8bc34a', //light-green
    //     '#cddc39', //lime
    //     '#ffeb3b', //yellow
    //     '#ffc107', //amber
    //     '#ff9800', //orange
    //     '#ff5722', //deep-orange
    //     '#d32f2f'  //red
    // ]
  
    let dom = {};
    dom.container = document.querySelector('#analyse_module > .swipe_container');
    dom.table = document.querySelector('#analyse_module .infoj');
    dom.pages = document.querySelectorAll('#analyse_module .page_content');
    dom.btnOff = document.querySelector('#analyse_module .btnOff');

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

    dom.btnOff.addEventListener('click', function(){
        resetModule();
    });

    function resetModule() {
        //dom.pages[1].style.display = 'none';
        dom.pages[1].innerHTML = '';
        dom.pages[0].style.display = 'block';
        dom.container.style['marginLeft'] = '0';
        dataArray.map(function (obj) {
            if (obj.layer) _this.map.removeLayer(obj.layer);
            obj.layer = null;
            obj.infoj = null;
            obj.container = null;
        });
    }

    // _this.map.on('click', function (e) {
    //     let space = dataArray.filter(function (obj) {
    //         if (!obj.infoj) return obj
    //     });
    //     if (space.length > 0) addToDataArray(e, space[0])
    // });

    _this.analyse = {};

    _this.analyse.add = function(feature){
        let space = dataArray.filter(function (obj) {
            if (!obj.infoj) return obj
        });
        if (space.length > 0) addToDataArray(feature, space[0])
    }

    function addToDataArray(feature, entry) {
        dom.container.style['marginLeft'] = '-50%';

        entry.infoj = feature.infoj;
        entry.layer = L.geoJson({
            type: "Feature",
            geometry: feature.geometry
            // "geometry": {
            //     "type": "Point",
            //     "coordinates": [e.latlng.lng, e.latlng.lat]
            // }
        }, {
                interactive: false,
                style: {
                    stroke: true,
                    color: entry.color,
                    weight: 1,
                    fill: false
                  }
                // pointToLayer: function (feature, latlng) {
                //     return new L.Marker(latlng, {
                //         icon: L.icon({
                //             iconUrl: svg_marker(entry.letter, entry.color),
                //             iconSize: [40, 40],
                //             iconAnchor: [20, 40]
                //         }),
                //         interactive: false
                //     });
                // }
            }).addTo(_this.map);

        createInfojTable(entry);
    }

    function createInfojTable(feature) {

        // Create container element to contain the header with controls and the info table.
        let container = document.createElement('div');
        feature.container = container;
        container.className = 'infojContainer';

        // Create the header element to contain the control elements
        let header = document.createElement('div');
        header.textContent = feature.letter;
        header.className = 'infojHeader';

        // Create the clear control element to control the removal of a feature from the dataArray.
        let i = document.createElement('i');
        i.textContent = 'clear';
        i.style.color = feature.color;
        i.className = 'material-icons cursor infojBtn';
        i.addEventListener('click', function(){
            this.parentNode.parentNode.remove();
            _this.map.removeLayer(feature.layer);
            feature.layer = null;
            feature.infoj = null;
            feature.container = null;
        });
        header.appendChild(i);

        // Create the zoom control element which zoom the map to the bounds of the feature.
        i = document.createElement('i');
        i.textContent = 'search';
        i.style.color = feature.color;
        i.className = 'material-icons cursor infojBtn';
        i.addEventListener('click', function(){
            _this.map.flyToBounds(feature.layer.getBounds());
        });
        header.appendChild(i);
        
        // Create the expand control element which controls whether the data table is displayed for the feature.
        i = document.createElement('i');
        i.textContent = 'expand_less';
        i.style.color = feature.color;
        i.className = 'material-icons cursor infojBtn';
        i.addEventListener('click', function(){
            let container = this.parentNode.parentNode;
            let header = this.parentNode;
            if (container.style.maxHeight != (this.clientHeight + 5) + 'px') {
                container.style.maxHeight = (this.clientHeight + 5) + 'px';
                header.style.boxShadow = '0 7px 6px -4px black';
                this.textContent = 'expand_more';
            } else {
                container.style.maxHeight = (header.nextSibling.clientHeight + this.clientHeight + 5) + 'px';
                header.style.boxShadow = '';
                this.textContent = 'expand_less';
            }
        });
        header.appendChild(i);

        // Add header element to the container.
        container.appendChild(header);

        // Create table element to display the features properties.
        let table = document.createElement('table');
        table.className="infojTable";
        table.style.borderTop = '3px solid ' + feature.color;
        table.style.borderBottom = '1px solid ' + feature.color;
        table.cellpadding="0";
        table.cellspacing="0";

        // Add table element to the container.
        container.appendChild(table);

        // Filter empty features from dataArray;
        let space = dataArray.filter(function (obj) {
            if (obj.container) return obj
        });

        // Insert container before the next container (alphabetical order) which is not empty or at the end (null).
        dom.pages[1].insertBefore(container, space.length > space.indexOf(feature) + 1 && space[space.indexOf(feature) + 1].container ? space[space.indexOf(feature) + 1].container : null);

        // Populate the table from the features infoj object.
        feature.infoj.map(function (row) {

            let tr;

            // Function to decide on process flow object / array / print value.
            (function processDataRow(lv, attribute, row) {

                if (typeof row === 'object' && row.length > 0) {
                    row.map(function (arr) {
                        processDataRow(lv + 1, 'key', arr);
                    })
                } else if (typeof row === 'object') {
                    Object.keys(row).map(function (key) {
                        addToTable(lv, 'key', key);
                        processDataRow(lv, 'val', row[key]);
                    });
                } else {
                    addToTable(lv, attribute, row);
                }

                function addToTable(lv, attribute, val) {
                    let td = document.createElement('td');
                    td.className = 'col-a ' + (attribute === 'key' ? 'lv-' + lv : attribute);
                    td.textContent = val;

                    // Add extra row for non numeric values otherwise add value in second column.
                    if (isNaN(val)) {
                        tr = document.createElement('tr');
                        td.colSpan = attribute === 'key' ? '1' : '2';
                        tr.appendChild(td);
                        table.appendChild(tr);
                    } else {
                        tr.appendChild(td);
                    }
                }

            })(0, 'key', row)
        });
    }
}