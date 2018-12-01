import _xyz from '../../_xyz.mjs';

// import pointOnFeature from '@turf/point-on-feature';

export default record => {

  record.upload = _xyz.utils.createElement({
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

        const xhr = new XMLHttpRequest();

        xhr.open('POST', _xyz.host + '/api/location/update?token=' + _xyz.token);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = e => {

          if (e.target.status !== 200) return console.log(e.target.response);

          // Hide upload symbol.
          record.upload.style.display = 'none';

          // Reload layer.
          _xyz.layers.list[record.location.layer].get();

          // Reset location infoj with response.
          record.location.infoj = JSON.parse(e.target.response);

          // Update the record.
          record.update();       

          // try {
          //     let pof = pointOnFeature(record.location.L.toGeoJSON());

          //     record
          //         .location
          //         .M
          //         .getLayers()[0]
          //         .setLatLng(L.latLng(pof.geometry.coordinates.reverse()));

          // } catch (err) {
          //     Object.keys(err).forEach(key => !err[key] && delete err[key]);
          //     console.error(err);
          // }
        };

        const infoj_newValues = record.location.infoj
          .filter(entry => (entry.newValue))
          .map(entry => {
            return {
              field: entry.field,
              newValue: entry.newValue,
              type: entry.type
            };
          });

        xhr.send(JSON.stringify({
          locale: _xyz.locale,
          layer: record.location.layer,
          table: record.location.table,
          id: record.location.id,
          infoj: infoj_newValues
        }));

      }
    }
  });
};