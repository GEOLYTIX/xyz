import infoTable from './infoTable.mjs';

export default _xyz => {

  infoTable(_xyz);

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

    location.info_table = _xyz.locations.infoTable(location);

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
      .setLatLng([lnglat[1], lnglat[0]])
      .setContent(scrolly)
      .openOn(_xyz.map);

    _xyz.utils.scrolly(scrolly);

  };

};