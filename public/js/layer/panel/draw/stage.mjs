import _xyz from '../../../_xyz.mjs';

export default (layer, marker) => {
  
  let tooltip = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'stage-tooltip'
    }
  });

  _xyz.utils.createElement({
    tag: 'i',
    options: {
      textContent: 'cloud_upload',
      className: 'material-icons cursor noselect btn_header',
      title: 'Save to cloud'
    },
    style: {
      display: 'inline-block'
    },
    appendTo: tooltip,
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

          _xyz.locations.select({
            layer: layer.key,
            table: layer.table,
            id: e.target.response,
            marker: marker,
            edit: layer.edit
          });
        };

        xhr.send(JSON.stringify({
          locale: _xyz.locale,
          layer: layer.key,
          table: layer.table,
          geometry: {
            type: 'Point',
            coordinates: marker
          }
        }));

        _xyz.state.finish();

      }
    }
  });

  _xyz.utils.createElement({
    tag: 'i',
    options: {
      textContent: 'clear',
      className: 'material-icons cursor noselect btn_header',
      title: 'Remove feature'
    },
    style: {
      display: 'inline-block'
    },
    appendTo: tooltip,
    eventListener: {
      event: 'click',
      funct: e => {
        e.stopPropagation();
        _xyz.state.finish();
      }
    }
  });

  return tooltip;

};