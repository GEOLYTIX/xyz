export default (_xyz, layer, marker) => {
  
  const tooltip = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'stage-tooltip'
    }
  });

  const tr = _xyz.utils.createElement({
    tag: 'tr',
    appendTo: tooltip
  });

  _xyz.utils.createElement({
    tag: 'i',
    options: {
      textContent: 'cloud_upload',
      className: 'material-icons cursor noselect btn-tooltip',
      title: 'Save to cloud'
    },
    appendTo: tr,
    eventListener: {
      event: 'click',
      funct: e => {

        e.stopPropagation();

        const xhr = new XMLHttpRequest();
        xhr.open('POST', _xyz.host + '/api/location/edit/draw?token=' + _xyz.token);
        xhr.setRequestHeader('Content-Type', 'application/json');
          
        xhr.onload = e => {
      
          if (e.target.status !== 200) return;

          layer.loaded = false;
          layer.get();
                    
          // Select polygon when post request returned 200.
          _xyz.locations.select({
            layer: layer.key,
            table: layer.table,
            id: e.target.response,
            marker: marker,
            edit: layer.edit
          });
      
        };
            
        // Send path geometry to endpoint.
        xhr.send(JSON.stringify({
          locale: _xyz.locale,
          layer: layer.key,
          table: layer.table,
          geometry: {
            type: 'Point',
            coordinates: marker
          }
        }));

        _xyz.map.closePopup();
        _xyz.state.finish();

      }
    }
  });

  _xyz.utils.createElement({
    tag: 'i',
    options: {
      textContent: 'clear',
      className: 'material-icons cursor noselect btn-tooltip',
      title: 'Remove feature'
    },
    appendTo: tr,
    eventListener: {
      event: 'click',
      funct: e => {
        e.stopPropagation();
        layer.edit.vertices.clearLayers();
        _xyz.map.closePopup();
        _xyz.state.finish();
      }
    }
  });

  return tooltip;

};