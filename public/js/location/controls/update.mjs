export default (_xyz, record) => {

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
          _xyz.layers.list[record.location.layer].loaded = false;
          _xyz.layers.list[record.location.layer].get();

          // Reset location infoj with response.
          record.location.infoj = JSON.parse(e.target.response);

          // Update the record.
          record.location.view.update();       

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
          locale: _xyz.workspace.locale.key,
          layer: record.location.layer,
          table: record.location.table,
          id: record.location.id,
          infoj: infoj_newValues
        }));

      }
    }
  });

  record.location.showUpload = () => {

    // Hide upload button if no other field in the infoj has a newValue.
    if (!record.location.infoj.some(field => field.newValue)) {
      return record.upload.style.display = 'none';
    }

    record.upload.style.display = 'block';

  };
  
};