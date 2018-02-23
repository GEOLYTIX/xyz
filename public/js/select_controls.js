const utils = require('./utils');

function clear(dom, record) {
    let i = utils.createElement('i', {
        textContent: 'clear',
        className: 'material-icons cursor noselect btn',
        title: 'Remove feature from selection'
    });
    i.style.color = record.color;
    i.style.marginRight = '-6px';
    i.addEventListener('click', function () {
        record.drawer.remove();

        _xyz.filterHook('select', record.letter + '!' + record.layer.layer + '!' + record.layer.table + '!' + record.layer.id + '!' + record.layer.marker[0] + ';' + record.layer.marker[1]);
        if (record.layer.L) _xyz.map.removeLayer(record.layer.L);
        if (record.layer.M) _xyz.map.removeLayer(record.layer.M);
        if (record.layer.D) _xyz.map.removeLayer(record.layer.D);
        record.layer = null;

        let freeRecords = _xyz.select.records.filter(function (record) {
            if (!record.layer) return record
        });

        dom.header.style.background = 'linear-gradient(90deg, #cf9 ' + parseInt(100 - ((freeRecords.length / _xyz.select.records.length) * 100)) + '%, #eee 0%)';

        if (freeRecords.length === _xyz.select.records.length) _xyz.select.resetModule();
    });
    record.header.appendChild(i);
}

function zoom(dom, record) {
    let i = utils.createElement('i', {
        textContent: 'search',
        className: 'material-icons cursor noselect btn',
        title: 'Zoom map to feature bounds'
    });
    i.style.color = record.color;
    i.addEventListener('click', function () {
        _xyz.map.flyToBounds(record.layer.L.getBounds());
    });
    record.header.appendChild(i);
}

function expander(dom, record) {
    let i = utils.createElement('i', {
        textContent: 'expand_less',
        className: 'material-icons cursor noselect btn',
        title: 'Expand table'
    });
    i.style.color = record.color;
    i.addEventListener('click', function () {
        if (record.drawer.style.maxHeight != '35px') {
            record.drawer.style.maxHeight = '35px';
            record.header.style.boxShadow = '0 3px 3px -3px black';
            this.textContent = 'expand_more';
            i.title = "Hide table";
        } else {
            record.drawer.style.maxHeight = (record.header.nextSibling.clientHeight + this.clientHeight + 10) + 'px';
            record.header.style.boxShadow = '';
            this.textContent = 'expand_less';
            i.title = "Expand table";
        }
    });
    record.header.appendChild(i);
}

function marker(dom, record) {
    let i = utils.createElement('i', {
        textContent: 'location_off',
        className: 'material-icons cursor noselect btn',
        title: 'Hide marker'
    });
    i.style.color = record.color;
    i.addEventListener('click', function () {
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
    record.header.appendChild(i);
}

function update(dom, record) {
    record.upload = utils.createElement('i', {
        textContent: 'cloud_upload',
        className: 'material-icons cursor noselect btn',
        title: 'Save changes to cloud'
    });
    record.upload.style.display = 'none';
    record.upload.style.color = record.color;
    record.upload.addEventListener('click', function () {

        let _layer = _xyz.countries[_xyz.country].layers[record.layer.layer];

        let xhr = new XMLHttpRequest();
        xhr.open('POST', 'q_update');
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function () {
            if (this.status === 200) {
                record.upload.style.display = 'none';

                //let test = record.drawer.getElementsByClassName('changed');
                utils.removeClass(record.drawer.querySelectorAll('.changed'),'changed');

                _layer.getLayer();
                try {
                    record.layer.M
                        .getLayers()[0]
                        .setLatLng(record.layer.L
                            .getLayers()[0]
                            .getLatLng()
                        );
                } catch(err){}
            }
        }
        xhr.send(JSON.stringify({
            dbs: _layer.dbs,
            table: record.layer.table,
            dbs: _layer.dbs,
            qID: _layer.qID,
            id: record.layer.id,
            infoj: record.layer.infoj,
            geometry: record.layer.L.toGeoJSON().features[0].geometry
        }));

    });
    record.header.appendChild(record.upload);
}

function trash(dom, record) {
    let i = utils.createElement('i', {
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
                record.drawer.remove();

                _xyz.filterHook('select', record.letter + '!' + record.layer.layer + '!' + record.layer.table + '!' + record.layer.id + '!' + record.layer.marker[0] + ';' + record.layer.marker[1]);
                if (record.layer.L) _xyz.map.removeLayer(record.layer.L);
                if (record.layer.M) _xyz.map.removeLayer(record.layer.M);
                if (record.layer.D) _xyz.map.removeLayer(record.layer.D);
                record.layer = null;

                let freeRecords = _xyz.select.records.filter(function (record) {
                    if (!record.layer) return record
                });

                dom.header.style.background = 'linear-gradient(90deg, #cf9 ' + parseInt(100 - ((freeRecords.length / _xyz.select.records.length) * 100)) + '%, #eee 0%)';

                if (freeRecords.length === _xyz.select.records.length) _xyz.select.resetModule();
            }
        }
        xhr.send(JSON.stringify({
            dbs: _layer.dbs,
            table: record.layer.table,
            qID: _layer.qID,
            id: record.layer.id
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