const utils = require('./utils');
const svg_symbols = require('./svg_symbols');

module.exports = function Select(){

    // Set dom elements for the select module.
    let dom = {
        header: document.querySelector('#select_module .header'),
        btnOff: document.querySelector('#select_module .btnOff'),
        layers: document.querySelector('#select_module .layers')
    };

    // Create select pane. This pane has a shadow filter associated in the css.
    _xyz.map.createPane('select');
    _xyz.map.getPane('select').style.zIndex = 600;
    _xyz.map.createPane('select_marker');
    _xyz.map.getPane('select_marker').style.zIndex = 601;
    _xyz.map.createPane('select_circle');
    _xyz.map.getPane('select_circle').style.zIndex = 602;
    // let sheet = document.styleSheets[1];
    // sheet.insertRule(".page_content { background-color: red; }", 1);

    // init() is called upon initialisation and when the country is changed (change_country === true).
    _xyz.select.init = function (change_country) {

        // Remove the layers hook on change_country event.
        if (change_country) resetModule();

        // Set the layer display from hooks if present; Overwrites the default setting.
        if (_xyz.hooks.select) _xyz.hooks.select.map(function(hook) {
            let selectionHook = hook.split('!');
            selectLayerFromEndpoint({
                layer: selectionHook[1],
                table: selectionHook[2],
                id: selectionHook[3],
                marker: [selectionHook[4].split(';')[0], selectionHook[4].split(';')[1]]
            });
        });
        _xyz.removeHook('select');
    }
    _xyz.select.init();

    // Reset the module on btnOff click.
    dom.btnOff.addEventListener('click', function(){
        resetModule();
    });

    // Reset function for the module container.
    function resetModule() {
        dom.btnOff.style.display = 'none';
        dom.header.style.background = '#eee';
        dom.layers.innerHTML = '';
        _xyz.removeHook('select');
        _xyz.select.records.map(function (record) {
            if (record.layer && record.layer.L) _xyz.map.removeLayer(record.layer.L);
            if (record.layer && record.layer.M) _xyz.map.removeLayer(record.layer.M);
            if (record.layer && record.layer.D) _xyz.map.removeLayer(record.layer.D);
            record.layer = null;
        });
    }

    // Get layer from data source
    function selectLayerFromEndpoint(layer) {
        let freeRecords = _xyz.select.records.filter(function (record) {
            if (!record.layer) return record
        });
        if (freeRecords.length === 0) return

        let _layer = _xyz.countries[_xyz.country].layers[layer.layer];

        // Create new xhr for /q_select
        let xhr = new XMLHttpRequest();
        xhr.open('GET', localhost + 'q_select?' + utils.paramString({
            dbs: _layer.dbs,
            table: layer.table,
            qID: _layer.qID,
            id: layer.id,
            //infoj: _layer.infoj,
            infoj: utils.infoj2pgsql(_layer.infoj),
            geomj: _layer.geomj,
            displayGeom: _layer.displayGeom || ''
        }));
        
        //console.log(_layer.infoj);
        //console.log(utils.infoj2pgsql(_layer.infoj2));
    
        // Request infoj and geometry from data source
        xhr.onload = function () {
            if (this.status === 200) {
                let json = JSON.parse(this.responseText);
                layer.geometry = JSON.parse(json[0].geomj);
                layer.infoj = json[0].infoj;
                layer.editable = _layer.editable;
                layer.displayGeom = _layer.displayGeom ? JSON.parse(json[0].displaygeom) : null;
                addLayerToRecord(layer);
            }
        }
        xhr.send();
    }
    _xyz.select.selectLayerFromEndpoint = selectLayerFromEndpoint;

    function addLayerToRecord(layer){
        let freeRecords = _xyz.select.records.filter(function (record) {
            if (!record.layer) return record
        });

        // Set marker coordinates from point geometry.
        if (layer.geometry.type === 'Point') layer.marker = layer.geometry.coordinates;

        dom.btnOff.style.display = 'block';
        dom.header.style.background = 'linear-gradient(90deg, #cf9 ' + parseInt(100 - (((freeRecords.length - 1) / _xyz.select.records.length) * 100)) + '%, #eee 0%)';

        if (freeRecords.length > 0) {
            freeRecords[0].layer = layer;
            if(layer.layer) {
                _xyz.pushHook('select',
                freeRecords[0].letter + '!' +
                freeRecords[0].layer.layer + '!' +
                freeRecords[0].layer.table + '!' +
                freeRecords[0].layer.id + '!' +
                freeRecords[0].layer.marker[0] + ';' +
                freeRecords[0].layer.marker[1]);
            }
            
            addRecordToMap(freeRecords[0])
        }
        if (freeRecords.length === 1) dom.header.style.background = '#ffcc80';
    }
    _xyz.select.addLayerToRecord = addLayerToRecord;

    function addRecordToMap(record) {
        if (record.layer.displayGeom) {
            record.layer.D = L.geoJson(
                {
                    type: 'Feature',
                    geometry: record.layer.displayGeom
                }, {
                    interactive: false,
                    pane: 'select',
                    style: {
                        stroke: false,
                        color: record.color,
                        weight: 2,
                        fill: true,
                        fillOpacity: 0.3
                    }
                }).addTo(_xyz.map);
        }

        if (record.layer.marker) {
            record.layer.M = L.geoJson(
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: record.layer.marker
                    }
                }, {
                    pointToLayer: function (feature, latlng) {
                        return new L.Marker(latlng, {
                            icon: L.icon({
                                iconUrl: svg_symbols.markerLetter(record.color, record.letter),
                                iconSize: [40, 40],
                                iconAnchor: [20, 40]
                            }),
                            interactive: false,
                            pane: 'select_marker'
                        });
                    }
                }).addTo(_xyz.map);
        }

        record.layer.L = L.geoJson(
            {
                type: 'Feature',
                geometry: record.layer.geometry
            }, {
                interactive: false,
                pane: 'select',
                style: {
                    stroke: true,
                    color: record.color,
                    fill: true,
                    fillOpacity: 0
                },
                pointToLayer: function (feature, latlng) {
                    return L.marker(
                        latlng,
                        {
                            icon: L.icon({
                                iconSize: 35,
                                iconUrl: svg_symbols.circle(record.color)
                            }),
                            pane: 'select_circle',
                            interactive: true,
                            draggable: record.layer.editable
                        });
                }
            }).addTo(_xyz.map);

            addRecordToList(record);
    }

    function addRecordToList(record) {

        // Create container element to contain the header with controls and the info table.
        record.layer.drawer = document.createElement('div');
        record.layer.drawer.className = 'drawer';

        // Create the header element to contain the control elements
        let header = utils.createElement('div', {
            textContent: record.letter,
            className: 'header'
        });
        header.style.borderBottom = '3px solid ' + record.color;

        // Create the clear control element to control the removal of a feature from the select.layers.
        let i = utils.createElement('i', {
            textContent: 'clear',
            className: 'material-icons cursor noselect btn',
            title: 'Remove feature from selection'
        });
        i.style.color = record.color;
        i.style.marginRight = '-6px';
        i.addEventListener('click', function(){
            record.layer.drawer.remove();

            _xyz.filterHook('select', record.letter + '!' + record.layer.layer + '!' + record.layer.table + '!' + record.layer.id + '!' + record.layer.marker[0] + ';' + record.layer.marker[1]);
            if (record.layer.L) _xyz.map.removeLayer(record.layer.L);
            if (record.layer.M) _xyz.map.removeLayer(record.layer.M);
            if (record.layer.D) _xyz.map.removeLayer(record.layer.D);
            record.layer = null;

            let freeRecords = _xyz.select.records.filter(function (record) {
                if (!record.layer) return record
            });
    
            dom.header.style.background = 'linear-gradient(90deg, #cf9 ' + parseInt(100 - ((freeRecords.length / _xyz.select.records.length) * 100)) + '%, #eee 0%)';

            if (freeRecords.length === _xyz.select.records.length) resetModule();
        });
        header.appendChild(i);

        // Create the zoom control element which zoom the map to the bounds of the feature.
        i = utils.createElement('i', {
            textContent: 'search',
            className: 'material-icons cursor noselect btn',
            title: 'Zoom map to feature bounds'
        });
        i.style.color = record.color;
        i.addEventListener('click', function(){
            _xyz.map.flyToBounds(record.layer.L.getBounds());
        });
        header.appendChild(i);
        
        // Create the expand control element which controls whether the data table is displayed for the feature.
        i = utils.createElement('i', {
            textContent: 'expand_less',
            className: 'material-icons cursor noselect btn',
            title: 'Expand table'
        });
        i.style.color = record.color;
        i.addEventListener('click', function(){
            let container = this.parentNode.parentNode;
            let header = this.parentNode;
            if (container.style.maxHeight != '30px') {
                container.style.maxHeight = '30px';
                header.style.boxShadow = '0 3px 3px -3px black';
                this.textContent = 'expand_more';
                i.title="Hide table";
            } else {
                container.style.maxHeight = (header.nextSibling.clientHeight + this.clientHeight + 5) + 'px';
                header.style.boxShadow = '';
                this.textContent = 'expand_less';
                i.title="Expand table";
            }
        });
        header.appendChild(i);

        // Create control to toggle marker.
        if (record.layer.marker) {
            i = utils.createElement('i', {
                textContent: 'location_off',
                className: 'material-icons cursor noselect btn',
                title: 'Hide marker'
            });
            i.style.color = record.color;
            i.addEventListener('click', function () {
                let container = this.parentNode.parentNode;
                let header = this.parentNode;
                if (this.textContent === 'location_off') {
                    _xyz.map.removeLayer(record.layer.M);
                    this.textContent = 'location_on';
                    i.title = 'Show marker';
                } else {
                    _xyz.map.addLayer(record.layer.M);
                    this.textContent = 'location_off';
                    i.title = 'Hide marker';
                }
            });
            header.appendChild(i);
        }

        // Create control to toggle marker.
        if (record.layer.editable) {
            i = utils.createElement('i', {
                textContent: 'cloud_upload',
                className: 'material-icons cursor noselect btn',
                title: 'Save changes to cloud'
            });
            i.style.color = record.color;
            i.addEventListener('click', function () {

                let _layer = _xyz.countries[_xyz.country].layers[record.layer.layer];

                let xhr = new XMLHttpRequest();
                xhr.open('POST', 'q_update');
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.onload = function () {
                    if (this.status === 200) {  
                        _layer.getLayer();                 
                        record.layer.M
                            .getLayers()[0]
                            .setLatLng(record.layer.L
                                .getLayers()[0]
                                .getLatLng()
                            );
                    }
                }
                xhr.send(JSON.stringify({
                    dbs: _layer.dbs,
                    table: record.layer.table,
                    qID: _layer.qID,
                    id: record.layer.id,
                    geometry: record.layer.L.toGeoJSON().features[0].geometry
                }));

            });
            header.appendChild(i);

            i = utils.createElement('i', {
                textContent: 'delete',
                className: 'material-icons cursor noselect btn',
                title: 'Delete feature'
            });
            i.style.color = record.color;
            i.addEventListener('click', function () {

                let _layer = _xyz.countries[_xyz.country].layers[record.layer.layer];

                let xhr = new XMLHttpRequest();
                xhr.open('POST', 'q_delete');
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.onload = function () {
                    if (this.status === 200) {                   
                        _layer.getLayer();
                        record.layer.drawer.remove();

                        _xyz.filterHook('select', record.letter + '!' + record.layer.layer + '!' + record.layer.table + '!' + record.layer.id + '!' + record.layer.marker[0] + ';' + record.layer.marker[1]);
                        if (record.layer.L) _xyz.map.removeLayer(record.layer.L);
                        if (record.layer.M) _xyz.map.removeLayer(record.layer.M);
                        if (record.layer.D) _xyz.map.removeLayer(record.layer.D);
                        record.layer = null;
            
                        let freeRecords = _xyz.select.records.filter(function (record) {
                            if (!record.layer) return record
                        });
                
                        dom.header.style.background = 'linear-gradient(90deg, #cf9 ' + parseInt(100 - ((freeRecords.length / _xyz.select.records.length) * 100)) + '%, #eee 0%)';
            
                        if (freeRecords.length === _xyz.select.records.length) resetModule();
                    }
                }
                xhr.send(JSON.stringify({
                    dbs: _layer.dbs,
                    table: record.layer.table,
                    qID: _layer.qID,
                    id: record.layer.id
                }));

            });
            header.appendChild(i);
        }

        // Add header element to the container.
        record.layer.drawer.appendChild(header);

        // Create table element to display the features properties.
        let table = document.createElement('table');
        table.className = 'infojTable';
        table.style.borderBottom = '1px solid ' + record.color;
        table.cellpadding = '0';
        table.cellspacing = '0';

        // Add table element to the container.
        record.layer.drawer.appendChild(table);
        
        // Show images 
        function addImages(record){
            console.log(record);
            let id = record.letter,
                feature = record.layer.qID,
                images = record.layer.infoj.images.reverse() || [];
            
            console.log(record);
            
            let _tr = document.createElement('tr'),
                _img_tr = document.createElement('tr'),
                _td = document.createElement('td'),
                _div = document.createElement('div');
            
            _img_tr.id = 'img-container_' + id;
            _div.classList = 'img-container';
            _td.classList = 'lv-0';
            _td.colSpan = '2';
            
            // add images if there are any
            if(images.length){
                for(let image of images){
                    let _img_td = document.createElement('td'),
                        _img = document.createElement('img');
                    
                    _img.src =  localhost + 'images/' + image;
                    _img_td.appendChild(_img);
                    _img_tr.appendChild(_img_td);
                }
            }
            // add image picker
            let add_img = document.createElement('input'),
                add_td = document.createElement('td'),
                add_tr = document.createElement('tr');
            
            add_img.type = 'file';
            add_img.id = 'images_' + id;
            add_img.name = 'images_' + id;
            add_img.accept = 'images/*';
            
            add_td.colSpan = '2';
            
            add_td.appendChild(add_img);
            add_tr.appendChild(add_td);
            
            _div.appendChild(_img_tr);
            _td.appendChild(_div);
            _tr.appendChild(_td);
            table.appendChild(_tr);
            
            table.appendChild(add_tr);
            
            // add change event 
            document.getElementById('images_' + id).addEventListener('change', function(){
                this.disabled = true;
                _xyz.select.upload = this.files;
                
                let img_actions = document.createElement('div'),
                    new_td = document.createElement('td'),
                    
                    btn_add = document.createElement('button'),
                    btn_save = document.createElement('button'), 
                    btn_del = document.createElement('button');
                
                // name buttons
                btn_add.title = 'Replace image';
                btn_save.title = 'Save image';
                btn_del.title = 'Delete image';
                // set ids for buttons
                btn_add.id = 'img-add';
                btn_save.id = 'img-save';
                btn_del.id = 'img-del';
                // set icons for buttons
                btn_add.innerHTML = '<i class="material-icons">camera_alt</i>';
                btn_save.innerHTML = '<i class="material-icons">cloud_upload</i>';
                btn_del.innerHTML = '<i class="material-icons">delete_forever</i>';
                
                img_actions.classList = 'img-actions';
                
                img_actions.appendChild(btn_save);
                img_actions.appendChild(btn_add);
                img_actions.appendChild(btn_del);
                // add image actions
                new_td.appendChild(img_actions);
                // display selected image
                display_image(_xyz.select.upload);
                
                function display_image(fileObject){
                    let _reader = new FileReader(),
                        _new_img = document.createElement('img'),
                        _input = document.getElementById('images_' + id);
                    
                    _reader.onload = function(_re){
                        let _imageObj = new Image();
                        
                        _imageObj.onload = function(_ie){
                            let _canvas = document.createElement('canvas'),
                                max_size = _xyz.layers.image_max_size,
                                width = _imageObj.width,
                                height = _imageObj.height;
                            
                            // resize
                            if (width > height) {
                                if (width > max_size) {
                                    height *= max_size / width;
                                    width = max_size;
                                }
                            } else {
                                if (height > max_size) {
                                    width *= max_size / height;
                                    height = max_size;
                                }
                            }
                            _canvas.width = width;
                            _canvas.height = height;
                            _canvas.getContext('2d').drawImage(_imageObj, 0, 0, width, height);
                            
                            let dataURL = _canvas.toDataURL('image/*'),
                                blob = utils.dataURLToBlob(dataURL);
                            
                            //console.log('width: ' + width);
                            //console.log('height: ' + height);
                            //console.log(blob);
                            _xyz.select.blob = blob;
                            
                            _new_img.src = dataURL;
                            //_new_img.style.height = '160px';
                            
                            //new_td.appendChild(img_actions);
                            new_td.appendChild(_new_img);
                
                            _input.disabled = false;
                            _input.value = '';
                        }
                        _imageObj.src = _re.target.result;
                    }
                    if(fileObject[0].size < 1024*1024*50) {
                        _reader.readAsDataURL(fileObject[0]);
                    } else {
                        alert('Selected image is too large.');
                    }
                }
                
                let img_container = document.querySelector('div #img-container_' + id);
                img_container.insertBefore(new_td, img_container.childNodes[0]);
                
                // delete latest image 
                document.getElementById('img-del').addEventListener('click', function(){
                    let _img_row = document.getElementById('img-container_' + id),
                        _input = document.getElementById('images_'+ id);
                    
                    // remove image
                    _img_row.removeChild(_img_row.childNodes[0]);
                    //enable file input
                    _input.disabled = false;
                    // clear file list
                    _input.value = '';
                });
                
                // replace newly added image
                document.getElementById('img-add').addEventListener('click', function(){
                    let _img_row = document.getElementById('img-container_' + id),
                        _input = document.getElementById('images_' + id);
                    
                    _img_row.removeChild(_img_row.childNodes[0]);
                    // clear file list
                    _input.value = '';
                    // enable file input 
                    _input.disabled = false;
                    _input.click();
                });
                
                // save image
                document.getElementById('img-save').addEventListener('click', function(){
                    upload_image(_xyz.select.blob);
                });
                
                function remove_image_actions(){
                    let _container = document.querySelector('div #img-container_' + id + ' .img-actions'),
                        _input = document.getElementById('images_' + id);
                    
                    _container.remove();
                    // clear file list
                    _input.value = '';
                    // enable file input 
                    _input.disabled = false;
                }
                
                function upload_image(blob){
                    let xhr = new XMLHttpRequest(),
                        feature = record.layer.id,
                        dbs = _xyz.countries[_xyz.country].layers[record.layer.layer].dbs,
                        params = utils.paramString({
                            dbs: dbs,
                            feature: feature,
                            type: blob.type
                        }),
                        url = localhost + 'q_images?' + params;
                    
                    //console.log(url);
                    
                    //console.log(record.layer.layer);
                    
                    //console.log(_xyz.countries[_xyz.country].layers[record.layer.layer]);
                    
                    xhr.open("POST", url);
                    xhr.setRequestHeader("Content-Type", "application/octet-stream");
                    xhr.onload = function(){
                        if(this.status === 200){
                            remove_image_actions();
                            console.log(this.response);
                        }
                    }
                    xhr.send(blob);
                }
                
            });
            
        }

        // Filter empty features from select.layers;
        let freeRecords = _xyz.select.records.filter(function (record) {
            if (!record.layer) return record
        });

        // Insert container before the next container (alphabetical order) which is not empty or at the end (null).
        let idx = _xyz.select.records.indexOf(record);

        dom.layers.insertBefore(record.layer.drawer,dom.layers.children[idx]);
        
        console.log(record.layer.infoj);
        // Populate the table from the features infoj object.
        Object.keys(record.layer.infoj).map(function (key) {
            //console.log(record.layer.infoj[key]);
            if(key === 'images'){
                addImages(record);
            } else {
                (function processDataRow(lv, key, val) {
                    if(key){
                        if (val && typeof(val) === 'object') {
                            if (key.charAt(key.length -1) != '_') addToTable(lv, key, '', false);
                            Object.keys(val).map(function (key) {
                                processDataRow(lv + 1, key, val[key]);
                            });
                            
                        } else {
                           addToTable(lv, key, val, true);
                        }
                    }
                    
                    function addToTable(lv, key, val, editable) {
                        let tr = document.createElement('tr');
                        let td = document.createElement('td');
                        
                        td.className = 'lv-' + lv;
                        td.textContent = key;
                        tr.appendChild(td);
                        
                        if (isNaN(val)) {
                            table.appendChild(tr);
                            tr = document.createElement('tr');
                            td = document.createElement('td');
                            td.textContent = val;
                            td.colSpan = '2';
                        } else {
                            td = document.createElement('td');
                            td.textContent = val;
                        }
            
                        td.className = 'val';
                        td.contentEditable = editable;
                        
                        if(editable) addDropdown(key, td);
                        
                        tr.appendChild(td);
                        table.appendChild(tr);
                    }
                    
                    function addDropdown(key, element){
                        //console.log(record);
                        //console.log(_xyz.countries[_xyz.country].layers);
                        let survey = _xyz.countries[_xyz.country].layers[record.layer.layer].survey;   
                        //console.log(survey);
                        
                        if(survey && survey.hasOwnProperty(key)){
                            let select = document.createElement('select'),
                                options = survey[key];
                            
                            //console.log(options);
                            for(let option of options){
                                let opt = document.createElement('option');
                                opt.textContent = option;
                                select.appendChild(opt);
                            }
                            element.appendChild(select);
                        }
                    }
                    
                    
                })(0, key, record.layer.infoj[key])
            }
        });
    }
}