const utils = require('./utils');

function clear(dom, header, record) {
    let i = utils.createElement('i', {
        textContent: 'clear',
        className: 'material-icons cursor noselect btn',
        title: 'Remove feature from selection'
    });
    i.style.color = record.color;
    i.style.marginRight = '-6px';
    i.addEventListener('click', function () {
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
}

function zoom(dom, header, record) {
    let i = utils.createElement('i', {
        textContent: 'search',
        className: 'material-icons cursor noselect btn',
        title: 'Zoom map to feature bounds'
    });
    i.style.color = record.color;
    i.addEventListener('click', function () {
        _xyz.map.flyToBounds(record.layer.L.getBounds());
    });
    header.appendChild(i);
}

function expander(dom, header, record) {
    let i = utils.createElement('i', {
        textContent: 'expand_less',
        className: 'material-icons cursor noselect btn',
        title: 'Expand table'
    });
    i.style.color = record.color;
    i.addEventListener('click', function () {
        let container = this.parentNode.parentNode;
        let header = this.parentNode;
        if (container.style.maxHeight != '30px') {
            container.style.maxHeight = '30px';
            header.style.boxShadow = '0 3px 3px -3px black';
            this.textContent = 'expand_more';
            i.title = "Hide table";
        } else {
            container.style.maxHeight = (header.nextSibling.clientHeight + this.clientHeight + 10) + 'px';
            header.style.boxShadow = '';
            this.textContent = 'expand_less';
            i.title = "Expand table";
        }
    });
    header.appendChild(i);
}

function marker(dom, header, record) {
    let i = utils.createElement('i', {
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

function update(dom, header, record) {
    let i = utils.createElement('i', {
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
}

function trash(dom, header, record) {
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

module.exports = {
    clear: clear,
    zoom: zoom,
    expander: expander,
    marker: marker,
    update: update,
    trash: trash
}