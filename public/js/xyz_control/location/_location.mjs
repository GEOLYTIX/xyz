import view from './view.mjs';

import draw from './draw.mjs';

import drawGeoJSON from './drawGeoJSON.mjs';

export default _xyz => {

  return {

    view: view(_xyz),

    draw: draw(_xyz),

    drawGeoJSON: drawGeoJSON(_xyz),

    select: select,

    select_output: select_output,

    select_popup: select_popup,

    select_list: select_list,

    list: [
      {
        letter: 'A',
        color: '#9c27b0'
      },
      {
        letter: 'B',
        color: '#2196f3'
      },
      {
        letter: 'C',
        color: '#009688'
      },
      {
        letter: 'D',
        color: '#cddc39',
      },
      {
        letter: 'E',
        color: '#ff9800'
      },
      {
        letter: 'F',
        color: '#673ab7'
      },
      {
        letter: 'G',
        color: '#03a9f4'
      },
      {
        letter: 'H',
        color: '#4caf50'
      },
      {
        letter: 'I',
        color: '#ffeb3b'
      },
      {
        letter: 'J',
        color: '#ff5722'
      },
      {
        letter: 'K',
        color: '#0d47a1'
      },
      {
        letter: 'L',
        color: '#00bcd4'
      },
      {
        letter: 'M',
        color: '#8bc34a'
      },
      {
        letter: 'N',
        color: '#ffc107'
      },
      {
        letter: 'O',
        color: '#d32f2f'
      }]

  };

  function select(location) {

    const xhr = new XMLHttpRequest();

    xhr.open('GET', _xyz.host + '/api/location/select/id?' + _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
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

  function select_output(location) {

    location.info_table = _xyz.locations.view(location);

    _xyz.locations.select_popup(location);

  };

  function select_popup(location) {

    _xyz.L.popup({ closeButton: false })
      .setLatLng([location.marker[1], location.marker[0]])
      .setContent(location.info_table)
      .openOn(_xyz.map);

  };

  function select_list(list, lnglat, layer) {

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
              locale: _xyz.workspace.locale.key,
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
    _xyz.L.popup({ closeButton: false })
      .setLatLng([lnglat[1], lnglat[0]])
      .setContent(scrolly)
      .openOn(_xyz.map);

    _xyz.utils.scrolly(scrolly);

  };

};