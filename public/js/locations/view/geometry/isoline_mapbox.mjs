export default _xyz => {

  return {

    create: create,

    settings: settings,

  }

  function settings(entry) {

    if (entry.edit.isoline_mapbox && entry.edit.isoline_mapbox.minutes) return _xyz.utils.wire()`<div>`;
    
    const group = _xyz.utils.wire()`
    <div class="drawer panel expandable">`;

    group.appendChild(_xyz.utils.wire()`
    <div
      class="header primary-colour"
      style="text-align: left; font-weight: 400;"
      onclick=${e => {
        if (e) e.stopPropagation();
        _xyz.utils.toggleExpanderParent(e.target);
      }}>Mapbox Isoline settings`);

    entry.edit.isoline_mapbox.profile = entry.edit.isoline_mapbox.profile || 'driving';
    entry.edit.isoline_mapbox.minutes = entry.edit.isoline_mapbox.minutes || 10;

    const modes = [
      { Driving : 'driving' },
      { Walking: 'walking' },
      { Cycling: 'cycling' },
    ];

    entry.edit.isoline_mapbox.profile = 'driving';  

    group.appendChild(_xyz.utils.wire()`
    <div
      style="margin-top: 8px; display: grid; grid-template-columns: 50px 1fr; align-items: center;">
        <span style="grid-column: 1;">Mode</span>
        <div style="grid-column: 2;">
        <button class="btn-drop">
            <div
                class="head"
                onclick=${e => {
                    e.preventDefault();
                    e.target.parentElement.classList.toggle('active');
                }}>
                <span>Driving</span>
                <div class="icon"></div>
            </div>
            <ul>
                ${modes.map(
                keyVal => _xyz.utils.wire()`
                <li onclick=${e=>{
                    const drop = e.target.closest('.btn-drop');
                    drop.classList.toggle('active');
                    drop.querySelector(':first-child').textContent = Object.keys(keyVal)[0];
        
                    entry.edit.isoline_mapbox.profile = Object.values(keyVal)[0];
        
                }}>${Object.keys(keyVal)[0]}`)}`);
    
    group.appendChild(_xyz.utils.wire()`
    <div style="margin-top: 12px;">
      <span>Travel time in minutes: </span>
      <span class="bold">${entry.edit.isoline_mapbox.minutes}</span>
      <div class="input-range">
      <input
        class="secondary-colour-bg"
        type="range"
        min=5
        value=${entry.edit.isoline_mapbox.minutes}
        max=60
        step=1
        oninput=${e=>{
          entry.edit.isoline_mapbox.minutes = parseInt(e.target.value);
          e.target.parentNode.previousElementSibling.textContent = entry.edit.isoline_mapbox.minutes;
        }}>`);

    return group;
  }

  function create(entry) {

    const origin = entry.location.geometry.coordinates;

    const xhr = new XMLHttpRequest();

    xhr.open('GET', _xyz.host +
      '/api/location/edit/isoline/mapbox?' +
      _xyz.utils.paramString({
        locale: _xyz.workspace.locale.key,
        layer: entry.location.layer.key,
        table: entry.location.table,
        coordinates: origin.join(','),
        minutes: entry.edit.isoline_mapbox.minutes,
        profile: entry.edit.isoline_mapbox.profile,
        //id: entry.location.id,
        //field: entry.field,
        meta: entry.edit.isoline_mapbox.meta || null,
        token: _xyz.token
      }));

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';

    xhr.onload = e => {

      if (e.target.status === 406) {
        entry.location.view && entry.location.view.classList.remove('disabled');
        return alert(e.target.responseText);
      }

      if (e.target.status !== 200) {
        entry.location.view && entry.location.view.classList.remove('disabled');
        console.log(e.target.response);
        return alert('No route found. Try alternative set up.');
      }

      const xhr_save = new XMLHttpRequest();

      xhr_save.open('POST', _xyz.host +
      '/api/location/edit/isoline/mapbox/save?' +
      _xyz.utils.paramString({
        locale: _xyz.workspace.locale.key,
        layer: entry.location.layer.key,
        table: entry.location.table,
        field: entry.field,
        id: entry.location.id,
        meta: entry.edit.isoline_mapbox.meta || null,
        token: _xyz.token
      }));

      xhr_save.setRequestHeader('Content-Type', 'application/json');
      xhr_save.responseType = 'json';

      xhr_save.onload = _e => {

        if (_e.target.status !== 200) {
          entry.location.view && entry.location.view.classList.remove('disabled');
          console.log(_e.target.response);
          return alert('Something with saving isoline went wrong.');
        }

        Object.keys(_e.target.response).forEach(key => {

          entry.location.infoj.forEach(entry => {
            if (entry.field === key) entry.value = _e.target.response[key];
          });

        });

        // Update the location view.
        _xyz.locations.view.create(entry.location);

        //entry.location.flyTo();
      }

      xhr_save.send(JSON.stringify({
        profile: entry.edit.isoline_mapbox.profile,
        minutes: entry.edit.isoline_mapbox.minutes,
        isoline: e.target.response
      }));

    };

    xhr.send();

    entry.location.view && entry.location.view.classList.add('disabled');
  
  };

};