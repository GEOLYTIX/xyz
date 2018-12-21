import _xyz from '../../../_xyz.mjs';

import './info_table.mjs';

_xyz.locations.select = location => {

  const xhr = new XMLHttpRequest();

  xhr.open('GET', _xyz.host + '/api/location/select/id?' + _xyz.utils.paramString({
    locale: _xyz.locale,
    layer: location.layer,
    table: location.table,
    id: location.id,
    token: _xyz.token
  }));

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';
  
  xhr.onload = e => {
      
    if (e.target.status !== 200) return;

    location.infoj = e.target.response.infoj;
    location.geometry = e.target.response.geomj;
  
    _xyz.locations.select_output(location);

  };
  
  xhr.send();

};

_xyz.locations.select_output = location => {

  location.info_table = _xyz.locations.info_table(location);

  _xyz.locations.select_popup(location);

};

_xyz.locations.select_popup = location => {

  _xyz.L.popup({closeButton: false})
    .setLatLng(location.marker.reverse())
    .setContent(location.info_table)
    .openOn(_xyz.map);

};

_xyz.locations.select_list = (list, lnglat, layer) => {
  
  const ul = _xyz.utils.createElement({
    tag: 'ul',
    options: {
      className: 'location_list'
    }
  });

  for (let i = 0; i < list.length; i++) {

    _xyz.utils.createElement({
      tag: 'li',
      options: {
        textContent: list[i].label,
        'data-id': list[i].id,
        'data-marker': list[i].lnglat
      },
      appendTo: ul,
      eventListener: {
        event: 'click',
        funct: e => {

          _xyz.locations.select({
            locale: layer.locale,
            layer: layer.key,
            table: layer.table,
            id: e.target['data-id'],
            marker: e.target['data-marker'],
            edit: layer.edit
          });

        }
      }
    });

  }

  let scrolly = _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'content scrolly'
    }
  });

  let scrolly_track = _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'scrolly_track'
    },
    appendTo: scrolly
  });

  _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'scrolly_bar'
    },
    appendTo: scrolly_track
  });

  scrolly.appendChild(ul);

  // Populate leaflet popup with a html table and call scrolly to enable scrollbar.
  _xyz.L.popup({closeButton: false})
    .setLatLng(lnglat.reverse())
    .setContent(scrolly)
    .openOn(_xyz.map);

  _xyz.utils.scrolly(scrolly);


  // if (_xyz.view.mode === 'mobile') {

  //   // Remove the line marker which connects the cell with the drop down list;
  //   if (layer.keySelectionLine) _xyz.map.removeLayer(layer.keySelectionLine);

  //   let dom = {
  //     map: document.getElementById('Map'),
  //     location_drop: document.querySelector('.location_drop'),
  //     location_drop__close: document.querySelector('.location_drop__close'),
  //     location_table: document.querySelector('.location_table'),
  //     map_button: document.querySelector('.btn_column')
  //   };
  //   dom.location_table.innerHTML = table;
  //   dom.map_button.style['display'] = 'none';
  //   dom.location_drop.style['display'] = 'block';

  //   // Pan map according to the location of the cluster cell;
  //   let map_dom__height = _xyz.map_dom.clientHeight,
  //     map_dom__margin = parseInt(_xyz.map_dom.style.marginTop),
  //     shiftY = parseInt((map_dom__height + map_dom__margin * 2) / 2) + parseInt(dom.location_drop.clientHeight) / 2 - (e.containerPoint.y + map_dom__margin);

  //   // _xyz.map.setZoomAround(e.latlng, _xyz.map.getZoom() + 1, { animate: false });
  //   _xyz.map.panBy([0, -shiftY]);

  //   // Draw line marker which connects hex cell with drop down.
  //   layer.keySelectionLine = L.marker(lnglat.reverse(), {
  //     icon: _xyz.L.icon({
  //       iconUrl: 'data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%3F%3E%0A%3Csvg%20width%3D%223%22%20height%3D%221000%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%0A%3Cline%20x1%3D%222%22%20y1%3D%220%22%20x2%3D%222%22%20y2%3D%221000%22%0A%20%20%20%20%20%20stroke-width%3D%221%22%20stroke%3D%22%23079e00%22/%3E%0A%3C/svg%3E',
  //       iconSize: [3, 1000],
  //       iconAnchor: [2, 1000]
  //     })
  //   }).addTo(_xyz.map);

  //   // Button event to close the .location_drop.
  //   dom.location_drop__close.addEventListener('click', function () {
  //     if (layer.keySelectionLine) _xyz.map.removeLayer(layer.keySelectionLine);

  //     _xyz.map.panBy([0, parseInt(dom.location_drop.clientHeight) / 2]);

  //     dom.location_drop.style['display'] = 'none';
  //     dom.map_button.style['display'] = 'block';
  //   });
  // }

};