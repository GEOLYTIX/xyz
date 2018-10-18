import _xyz from '../_xyz.mjs';
import pointOnFeature from '@turf/point-on-feature';
import { switchState } from '../layer/panel/draw/_draw';

export function clear(record) {
  _xyz.utils.createElement({
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
        
        switchState(_xyz.state);
      
        _xyz.hooks.filter('select', record.location.layer + '!' + record.location.table + '!' + record.location.id + '!' + record.location.marker[0] + ';' + record.location.marker[1]);
        if (record.location.L) _xyz.map.removeLayer(record.location.L);
        if (record.location.M) _xyz.map.removeLayer(record.location.M);
        if (record.location.D) _xyz.map.removeLayer(record.location.D);
        record.location = null;

        // Find free records in locations array.
        let freeRecords = _xyz.locations.list.filter(record => record.location);

        // Return from selection if no free record is available.
        if (freeRecords.length === 0) _xyz.locations.init();

      }
    }
  });
}

export function zoom(record) {
  _xyz.utils.createElement({
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

export function expander(record) {
  _xyz.utils.createElement({
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
        _xyz.utils.toggleExpanderParent({
          expandable: record.drawer,
          scrolly: document.querySelector('.mod_container > .scrolly')
        });
      }
    }
  });
}

export function clipboard(record){
  _xyz.utils.createElement({
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

          //console.log(entry);

          let lbl = entry.label || '',
            val = entry.value || '',
            row = '';
                    
          row = lbl + '\t' + val;

          //console.log(row);

          data.push(row);
        }
                
        Object.values(record.location.infoj).forEach(entry => {
          if(entry.type === 'group'){
            data.push(entry.label);
            Object.values(entry.items).forEach(item => {
              processInfoj(item, data);
            });
          } else {
            processInfoj(entry, data);
          }
        });
                
        _xyz.utils.copyToClipboard(data.join('\n'));
      }
    }
  });
}

export function marker(record) {
  _xyz.utils.createElement({
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

export function update(record) {
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

        let
          layer = _xyz.layers.list[record.location.layer],
          xhr = new XMLHttpRequest();

        xhr.open('POST', _xyz.host + '/api/location/update?token=' + _xyz.token);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = e => {

          if (e.target.status !== 200) return;

          // Hide upload symbol.
          record.upload.style.display = 'none';

          // Remove changed class from all changed entries.
          let changedElements = record.drawer.querySelectorAll('.changed');
          changedElements.forEach(el => el.classList.remove('changed'));

          layer.get();

          try {
            
            let pof = pointOnFeature(record.location.L.toGeoJSON());
            
            record.location.M
              .getLayers()[0].setLatLng(L.latLng(pof.geometry.coordinates.reverse()));

          } catch (err) { console.error(err); }
        };

        xhr.send(JSON.stringify({
          locale: _xyz.locale,
          layer: layer.key,
          table: record.location.table,
          id: record.location.id,
          infoj: record.location.infoj,
          geometry: record.location.L.toGeoJSON().features[0].geometry
        }));
      }
    }
  });
}

export function trash(record) {
  _xyz.utils.createElement({
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

        switchState(_xyz.state);

        let layer = _xyz.layers.list[record.location.layer],
          xhr = new XMLHttpRequest();

        xhr.open('GET', _xyz.host + '/api/location/delete?' + _xyz.utils.paramString({
          locale: _xyz.locale,
          layer: layer.key,
          table: record.location.table,
          id: record.location.id,
          token: _xyz.token
        }));

        xhr.onload = e => {

          if (e.target.status !== 200) return;

          _xyz.map.removeLayer(layer.L);
          layer.get();
          record.drawer.remove();
    
          _xyz.hooks.filter('select', record.location.layer + '!' + record.location.table + '!' + record.location.id + '!' + record.location.marker[0] + ';' + record.location.marker[1]);
          if (record.location.L) _xyz.map.removeLayer(record.location.L);
          if (record.location.M) _xyz.map.removeLayer(record.location.M);
          if (record.location.D) _xyz.map.removeLayer(record.location.D);
          record.location = null;

          //console.log(_xyz);

          // Find free records in locations array.
          let freeRecords = _xyz.locations.list.filter(record => record.location);

          // Return from selection if no free record is available.
          if (freeRecords.length === 0) _xyz.locations.init();
    
          //let freeRecords = _xyz.ws.select.layers.records.filter(record => {
         // let freeRecords = _xyz.locations.list.filter(record => {
          //  if (!record.location) return record;
          //});
    
          //if (freeRecords.length === _xyz.ws.select.layers.records.length) _xyz.ws.select.resetModule();
        };
        xhr.send();
      }
    }
  });
}