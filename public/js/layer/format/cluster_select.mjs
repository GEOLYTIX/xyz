import _xyz from '../../_xyz.mjs';

import L from 'leaflet';

export default (e, layer) => {

  const xhr = new XMLHttpRequest();

  let
    count = e.layer.feature.properties.count,
    lnglat = e.layer.feature.geometry.coordinates;
  
  xhr.open('GET', _xyz.host + '/api/location/select/cluster?' + _xyz.utils.paramString({
    locale: _xyz.locale,
    layer: layer.key,
    table: layer.table,
    filter: JSON.stringify(layer.filter.current),
    count: count > 99 ? 99 : count,
    lnglat: lnglat,
    token: _xyz.token
  }));
  
  xhr.onload = () => {
  
    if (xhr.status !== 200) return;
    
    let cluster = JSON.parse(xhr.responseText);
  
    if (cluster.length === 1) {
      _xyz.locations.select({
        layer: layer.key,
        table: layer.table,
        id: cluster[0].id,
        marker: cluster[0].lnglat
      });
    }
  
    if (cluster.length > 1) {
  
      let table = '<table cellpadding="0" cellspacing="0">';
  
      for (let i = 0; i < cluster.length; i++) {
        table += '<tr data-id="' + cluster[i].id + '" data-marker="' + cluster[i].lnglat + '"><td>' + cluster[i].label + '</td></tr>';
      }
      table += '</table>';
  
      if (cluster.length == 99) table += '<caption><small>Cluster selection is limited to 99 feature.</small></caption>';
  
      if (_xyz.view.mode === 'desktop') {
  
        // Populate leaflet popup with a html table and call scrolly to enable scrollbar.
        layer.popup = L.popup()
          .setLatLng(lnglat.reverse())
          .setContent('<div class="content scrolly location_table"><div class="scrolly_track"><div class="scrolly_bar"></div></div>' + table + '</div>')
          .openOn(_xyz.map);
  
        setTimeout(() => _xyz.utils.scrolly(document.querySelector('.leaflet-popup-content > .scrolly')), 300);
      }
  
      if (_xyz.view.mode === 'mobile') {
  
        // Remove the line marker which connects the cell with the drop down list;
        if (layer.keySelectionLine) _xyz.map.removeLayer(layer.keySelectionLine);
  
        let dom = {
          map: document.getElementById('Map'),
          location_drop: document.querySelector('.location_drop'),
          location_drop__close: document.querySelector('.location_drop__close'),
          location_table: document.querySelector('.location_table'),
          map_button: document.querySelector('.btn_column')
        };
        dom.location_table.innerHTML = table;
        dom.map_button.style['display'] = 'none';
        dom.location_drop.style['display'] = 'block';
  
        // Pan map according to the location of the cluster cell;
        let map_dom__height = dom.map.clientHeight,
          map_dom__margin = parseInt(dom.map.style.marginTop),
          shiftY = parseInt((map_dom__height + map_dom__margin * 2) / 2) + parseInt(dom.location_drop.clientHeight) / 2 - (e.containerPoint.y + map_dom__margin);
  
          // _xyz.map.setZoomAround(e.latlng, _xyz.map.getZoom() + 1, { animate: false });
        _xyz.map.panBy([0, -shiftY]);
  
        // Draw line marker which connects hex cell with drop down.
        layer.keySelectionLine = L.marker(lnglat.reverse(), {
          icon: L.icon({
            iconUrl: 'data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%3F%3E%0A%3Csvg%20width%3D%223%22%20height%3D%221000%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%0A%3Cline%20x1%3D%222%22%20y1%3D%220%22%20x2%3D%222%22%20y2%3D%221000%22%0A%20%20%20%20%20%20stroke-width%3D%221%22%20stroke%3D%22%23079e00%22/%3E%0A%3C/svg%3E',
            iconSize: [3, 1000],
            iconAnchor: [2, 1000]
          })
        }).addTo(_xyz.map);
  
        // Button event to close the .location_drop.
        dom.location_drop__close.addEventListener('click', function () {
          if (layer.keySelectionLine) _xyz.map.removeLayer(layer.keySelectionLine);
  
          _xyz.map.panBy([0, parseInt(dom.location_drop.clientHeight) / 2]);
  
          dom.location_drop.style['display'] = 'none';
          dom.map_button.style['display'] = 'block';
        });
      }
  
      // Add event to query location info to the location list records.
      let location_table_rows = document.querySelectorAll('.location_table tr');
  
      for (let i = 0; i < location_table_rows.length; i++) {
        location_table_rows[i].addEventListener('click', e => {
          _xyz.locations.select({
            layer: layer.key,
            table: layer.table,
            id: e.target.parentNode.dataset.id,
            marker: e.target.parentNode.dataset.marker.split(',')
          });
        });
      }
    }
  };
  
  xhr.send();
  
};