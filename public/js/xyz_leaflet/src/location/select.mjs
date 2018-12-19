import _xyz from '../../../_xyz.mjs';

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
  
    alert(JSON.stringify(e.target.response));
        
  };
  
  xhr.send();

};