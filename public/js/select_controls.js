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
                utils.toggleExpanderParent(e.target, record.drawer);
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
    record.upload = utils.createElement('i', {
        textContent: 'cloud_upload',
        className: 'material-icons cursor noselect btn_header',
        title: 'Save changes to cloud'
    });
    record.upload.style.display = 'none';
    record.upload.style.color = record.color;
    record.upload.addEventListener('click', function () {

        let _layer = _xyz.locales[_xyz.locale].layers[record.location.layer];

        let xhr = new XMLHttpRequest();
        xhr.open('POST', 'q_update');
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = () => {
            if (xhr.status === 200) {
                record.upload.style.display = 'none';

                //let test = record.drawer.getElementsByClassName('changed');
                utils.removeClass(record.drawer.querySelectorAll('.changed'), 'changed');

                _layer.getLayer();
                try {
                    record.location.M
                        .getLayers()[0]
                        .setLatLng(record.location.L
                            .getLayers()[0]
                            .getLatLng()
                        );
                } catch (err) { }
            }
        }
        xhr.send(JSON.stringify({
            dbs: _layer.dbs,
            table: record.location.table,
            dbs: _layer.dbs,
            qID: _layer.qID,
            id: record.location.id,
            infoj: record.location.infoj,
            geometry: record.location.L.toGeoJSON().features[0].geometry
        }));

    });
    record.header.appendChild(record.upload);
}

function trash(record) {
    let i = utils.createElement('i', {
        textContent: 'delete',
        className: 'material-icons cursor noselect btn_header',
        title: 'Delete feature'
    });
    i.style.color = record.color;
    i.addEventListener('click', function () {

        let _layer = _xyz.locales[_xyz.locale].layers[record.location.layer];

        let xhr = new XMLHttpRequest();
        xhr.open('POST', 'q_delete');
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function () {
            if (this.status === 200) {
                _layer.getLayer();
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
        xhr.send(JSON.stringify({
            dbs: _layer.dbs,
            table: record.location.table,
            qID: _layer.qID,
            id: record.location.id
        }));

    });
    record.header.appendChild(i);
}

module.exports = {
    clear: clear,
    zoom: zoom,
    expander: expander,
    marker: marker,
    update: update,
    trash: trash
}