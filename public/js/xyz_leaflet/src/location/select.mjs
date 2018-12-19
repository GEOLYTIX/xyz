import _xyz from '../../../_xyz.mjs';

import info from './info.mjs';

_xyz.locations.select = location => {

  const xhr = new XMLHttpRequest();

  xhr.open('GET', _xyz.host + '/api/location/select/id?' + _xyz.utils.paramString({
    locale: location.locale,
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

  location.info_table = info(location);

  _xyz.locations.select_popup(location);

};

_xyz.locations.select_popup = location => {

  _xyz.L.popup()
    .setLatLng(location.marker.reverse())
    .setContent(location.info_table)
    .openOn(_xyz.map);

};