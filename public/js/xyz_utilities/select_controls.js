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

                _xyz.filterHook('select', record.letter + '!' + record.location.layer + '!' + record.location.table + '!' + record.location.id + '!' + record.location.marker[0] + ';' + record.location.marker[1]);
                if (record.location.L) _xyz.map.removeLayer(record.location.L);
                if (record.location.M) _xyz.map.removeLayer(record.location.M);
                if (record.location.D) _xyz.map.removeLayer(record.location.D);
                record.location = null;

                let freeRecords = _xyz.select.records.filter(function (record) {
                    if (!record.location) return record
                });

                if (freeRecords.length === _xyz.select.records.length) _xyz.select.resetModule();
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
                _xyz.map.flyToBounds(record.location.L.getBounds());
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
                let data = [], row;
                Object.keys(record.location.infoj).map(function(key){
                    let lbl = record.location.infoj[key].label || '',
                        val = record.location.infoj[key].value || '';
                    row = lbl + '\t' + val;
                    data.push(row);
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
                    _xyz.map.removeLayer(record.location.M);
                    e.target.textContent = 'location_on';
                    e.target.title = 'Show marker';
                } else {
                    _xyz.map.addLayer(record.location.M);
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

                let layer = _xyz.locales[_xyz.locale].layers[record.location.layer],
                    xhr = new XMLHttpRequest();

                xhr.open('POST', host + 'api/location/update');
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onload = e => {

                    if (e.target.status === 500) {
                        console.log(e.target.response);
                        return;
                    }

                    if (e.target.status === 401) {
                        document.getElementById('timeout_mask').style.display = 'block';
                        console.log(e.target.response);
                        return;
                    }

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
                    dbs: layer.dbs,
                    table: record.location.table,
                    qID: layer.qID,
                    id: record.location.id,
                    geom: layer.geom,
                    infoj: record.location.infoj,
                    geometry: record.location.L.toGeoJSON().features[0].geometry,
                    log_table: layer.log_table
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

                let layer = _xyz.locales[_xyz.locale].layers[record.location.layer],
                    xhr = new XMLHttpRequest();

                xhr.open('POST', host + 'api/location/delete');
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onload = e => {

                    if (e.target.status === 401) {
                        document.getElementById('timeout_mask').style.display = 'block';
                        console.log(e.target.response);
                        return;
                    }

                    _xyz.map.removeLayer(layer.L);
                    layer.getLayer();
                    record.drawer.remove();
    
                    _xyz.filterHook('select', record.letter + '!' + record.location.layer + '!' + record.location.table + '!' + record.location.id + '!' + record.location.marker[0] + ';' + record.location.marker[1]);
                    if (record.location.L) _xyz.map.removeLayer(record.location.L);
                    if (record.location.M) _xyz.map.removeLayer(record.location.M);
                    if (record.location.D) _xyz.map.removeLayer(record.location.D);
                    record.location = null;
    
                    let freeRecords = _xyz.select.records.filter(record => {
                        if (!record.location) return record
                    });
    
                    if (freeRecords.length === _xyz.select.records.length) _xyz.select.resetModule();
                }
                xhr.send(JSON.stringify({
                    dbs: layer.dbs,
                    table: record.location.table,
                    qID: layer.qID,
                    id: record.location.id,
                    log_table: layer.log_table
                }));
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