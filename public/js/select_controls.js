const utils = require('./utils');

function clear(record) {
    utils._createElement({
        tag: 'i',
        options: {
            textContent: 'clear',
            className: 'material-icons cursor noselect btn_header',
            title: 'Remove feature from selection'
        },
        style: {
            color: record.color,
            marginRight: '-6px'
        },
        appendTo: record.drawer,
        eventListener: {
            event: 'click',
            funct: e => {

                e.stopPropagation();
                record.drawer.remove();

                global._xyz.filterHook('select', record.letter + '!' + record.location.layer + '!' + record.location.table + '!' + record.location.id + '!' + record.location.marker[0] + ';' + record.location.marker[1]);
                if (record.location.L) global._xyz.map.removeLayer(record.location.L);
                if (record.location.M) global._xyz.map.removeLayer(record.location.M);
                if (record.location.D) global._xyz.map.removeLayer(record.location.D);
                record.location = null;

                let freeRecords = global._xyz.select.records.filter(function (record) {
                    if (!record.location) return record
                });

                if (freeRecords.length === global._xyz.select.records.length) global._xyz.select.resetModule();
            }
        }
    });
}

function zoom(record) {
    utils._createElement({
        tag: 'i',
        options: {
            textContent: 'search',
            className: 'material-icons cursor noselect btn_header',
            title: 'Zoom map to feature bounds'
        },
        style: {
            color: record.color,
            marginRight: '-6px'
        },
        appendTo: record.drawer,
        eventListener: {
            event: 'click',
            funct: e => {
                e.stopPropagation();
                global._xyz.map.flyToBounds(record.location.L.getBounds());
            }
        }
    });
}

function expander(record) {
    utils._createElement({
        tag: 'i',
        options: {
            className: 'material-icons cursor noselect btn_header expander',
            title: 'Zoom map to feature bounds'
        },
        style: {
            color: record.color,
            marginRight: '-6px'
        },
        appendTo: record.drawer,
        eventListener: {
            event: 'click',
            funct: e => {
                e.stopPropagation();
                utils.toggleExpanderParent({
                    expandable: record.drawer,
                    scrolly: document.querySelector('.mod_container > .scrolly')
                });
            }
        }
    });
}

function clipboard(record){
    utils._createElement({
        tag: 'i',
        options: {
            textContent: 'file_copy',
            className: 'material-icons cursor noselect btn_header',
            title: 'Copy to clipboard'
        },
        style: {
            color: record.color
        },
        appendTo: record.drawer,
        eventListener: {
            event: 'click',
            funct: e => {
                e.stopPropagation();
                
                let data = [];
                
                function processInfoj(entry, data) {
                    let lbl = entry.label || '',
                        val = entry.value || '',
                        row = '';
                    
                    row = lbl + '\t' + val;
                    data.push(row);
                }
                
                Object.values(record.location.infoj).forEach(entry => {
                    if(entry.type === "group"){
                        Object.values(entry.items).forEach(item => {
                            processInfoj(item, data);
                        });
                    } else {
                        processInfoj(entry, data);
                    }
                });
                
                utils.copy_to_clipboard(data.join('\n'));
            }
        }
    });
}

function marker(record) {
    utils._createElement({
        tag: 'i',
        options: {
            textContent: 'location_off',
            className: 'material-icons cursor noselect btn_header',
            title: 'Hide marker'
        },
        style: {
            color: record.color
        },
        appendTo: record.drawer,
        eventListener: {
            event: 'click',
            funct: e => {
                e.stopPropagation();
                if (e.target.textContent === 'location_off') {
                    global._xyz.map.removeLayer(record.location.M);
                    e.target.textContent = 'location_on';
                    e.target.title = 'Show marker';
                } else {
                    global._xyz.map.addLayer(record.location.M);
                    e.target.textContent = 'location_off';
                    e.target.title = 'Hide marker';
                }
            }
        }
    });
}

function update(record) {
    record.upload = utils._createElement({
        tag: 'i',
        options: {
            textContent: 'cloud_upload',
            className: 'material-icons cursor noselect btn_header',
            title: 'Save changes to cloud'
        },
        style: {
            display: 'none',
            color: record.color
        },
        appendTo: record.header,
        eventListener: {
            event: 'click',
            funct: e => {
                e.stopPropagation();

                let layer = global._xyz.locales[global._xyz.locale].layers[record.location.layer],
                    xhr = new XMLHttpRequest();

                xhr.open('POST', global._xyz.host + '/api/location/update?token=' + global._xyz.token);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onload = e => {

                    if (e.target.status !== 200) return;

                    // Hide upload symbol.
                    record.upload.style.display = 'none';

                    // Remove changed class from all changed entries.
                    utils.removeClass(record.drawer.querySelectorAll('.changed'), 'changed');

                    layer.getLayer();
                    try {
                        record.location.M
                            .getLayers()[0]
                            .setLatLng(
                                record.location.L
                                    .getLayers()[0]
                                    .getLatLng()
                            );
                    } catch (err) { }
                }

                xhr.send(JSON.stringify({
                    locale: _xyz.locale,
                    layer: layer.layer,
                    table: record.location.table,
                    id: record.location.id,
                    infoj: record.location.infoj,
                    geometry: record.location.L.toGeoJSON().features[0].geometry
                }));
            }
        }
    });
}

function trash(record) {
    utils._createElement({
        tag: 'i',
        options: {
            textContent: 'delete',
            className: 'material-icons cursor noselect btn_header',
            title: 'Delete feature'
        },
        style: {
            color: record.color
        },
        appendTo: record.header,
        eventListener: {
            event: 'click',
            funct: e => {
                e.stopPropagation();

                let layer = global._xyz.locales[global._xyz.locale].layers[record.location.layer],
                    xhr = new XMLHttpRequest();

                xhr.open('GET', global._xyz.host + '/api/location/delete?' + utils.paramString({
                    locale: _xyz.locale,
                    layer: layer.layer,
                    table: record.location.table,
                    id: record.location.id,
                    token: global._xyz.token
                }));

                xhr.onload = e => {

                    if (e.target.status !== 200) return;

                    global._xyz.map.removeLayer(layer.L);
                    layer.getLayer();
                    record.drawer.remove();
    
                    global._xyz.filterHook('select', record.letter + '!' + record.location.layer + '!' + record.location.table + '!' + record.location.id + '!' + record.location.marker[0] + ';' + record.location.marker[1]);
                    if (record.location.L) global._xyz.map.removeLayer(record.location.L);
                    if (record.location.M) global._xyz.map.removeLayer(record.location.M);
                    if (record.location.D) global._xyz.map.removeLayer(record.location.D);
                    record.location = null;
    
                    let freeRecords = global._xyz.select.records.filter(record => {
                        if (!record.location) return record
                    });
    
                    if (freeRecords.length === global._xyz.select.records.length) global._xyz.select.resetModule();
                }
                xhr.send();
            }
        }
    });
}

module.exports = {
    clear: clear,
    zoom: zoom,
    expander: expander,
    marker: marker,
    clipboard: clipboard,
    update: update,
    trash: trash
}