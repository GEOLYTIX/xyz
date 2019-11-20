export default _xyz => {

  return {

    create: create,

    settings: settings,

  }

  function settings(entry) {

    if (typeof(entry.edit.isoline_here) !== 'object') entry.edit.isoline_here = {};   
    
    const group = _xyz.utils.wire()`
    <div class="drawer panel expandable">`;

    group.appendChild(_xyz.utils.wire()`
    <div
      class="header primary-colour"
      style="text-align: left; font-weight: 400;"
      onclick=${e => {
        if (e) e.stopPropagation();
        _xyz.utils.toggleExpanderParent(e.target);
      }}>Here Isoline settings`);

    entry.edit.isoline_here.minutes = entry.edit.isoline_here.minutes || 10;
    entry.edit.isoline_here.distance = entry.edit.isoline_here.distance || 10;

    const modes = [
      { Driving: 'car' },
      { Walking: 'pedestrian' },
      { Cargo: 'truck' },
      { 'HOV lane': 'carHOV' }
    ];

    entry.edit.isoline_here.mode = 'car';

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
        
                    entry.edit.isoline_here.mode = Object.values(keyVal)[0];
        
                }}>${Object.keys(keyVal)[0]}`)}`);


    const ranges = [
      { "Time (min)": "time" },
      { "Distance (km)": "distance" }
    ]

    entry.edit.isoline_here.rangetype = 'time';
    
    group.appendChild(_xyz.utils.wire()`
    <div
        style="margin-top: 8px; display: grid; grid-template-columns: 50px 1fr; align-items: center;">
        <span style="grid-column: 1;">Range</span>
        <div style="grid-column: 2;">
        <button class="btn-drop">
            <div
                class="head"
                onclick=${e => {
                    e.preventDefault();
                    e.target.parentElement.classList.toggle('active');
                }}>
                <span>Time (min)</span>
                <div class="icon"></div>
            </div>
            <ul>
                ${ranges.map(
                keyVal => _xyz.utils.wire()`
                <li onclick=${e=>{
                    const drop = e.target.closest('.btn-drop');
                    drop.classList.toggle('active');
                    drop.querySelector(':first-child').textContent = Object.keys(keyVal)[0];
          
                    entry.edit.isoline_here.rangetype = Object.values(keyVal)[0];
          
                    const input = slider_here_range.querySelector('input');
          
                    if(entry.edit.isoline_here.rangetype === 'time') {
              
                      slider_here_range.querySelector('span').textContent = 'Travel time in minutes: ';
              
                      input.oninput = e => {
                        entry.edit.isoline_here.minutes = parseInt(e.target.value);
                        e.target.parentNode.previousElementSibling.textContent = entry.edit.isoline_here.minutes;
                      };
              
                      input.value = entry.edit.isoline_here.minutes;
                      input.parentNode.previousElementSibling.textContent = entry.edit.isoline_here.minutes;
                    
                    }
              
                    if(entry.edit.isoline_here.rangetype === 'distance') {
              
                      slider_here_range.querySelector('span').textContent = 'Travel distance in kilometer: ';
              
                      input.oninput = e => {
                        entry.edit.isoline_here.distance = parseInt(e.target.value);
                        e.target.parentNode.previousElementSibling.textContent = entry.edit.isoline_here.distance;
                      };
                      input.value = entry.edit.isoline_here.distance;
                      input.parentNode.previousElementSibling.textContent = entry.edit.isoline_here.distance;
                    }
        
                }}>${Object.keys(keyVal)[0]}`)}`);    

    const slider_here_range = _xyz.utils.wire()`
    <div style="margin-top: 12px;">
        <span>Travel time in minutes: </span>
        <span class="bold">${entry.edit.isoline_here.minutes}</span>
        <div class="input-range">
        <input
          class="secondary-colour-bg"
          type="range"
          min=5
          value=${entry.edit.isoline_here.minutes}
          max=60
          step=1
          oninput=${e=>{
            entry.edit.isoline_here.minutes = parseInt(e.target.value);
            e.target.parentNode.previousElementSibling.textContent = entry.edit.isoline_here.minutes;
          }}>`

    group.appendChild(slider_here_range);

    return group;
  }

  function create(entry) {

    const origin = [
      entry.location.geometry.coordinates[1],
      entry.location.geometry.coordinates[0]
    ];

    const xhr = new XMLHttpRequest();

    xhr.open('GET', _xyz.host +
      '/api/location/edit/isoline/here/info?' +
      _xyz.utils.paramString({
        locale: _xyz.workspace.locale.key,
        layer: entry.location.layer.key,
        table: entry.location.table,
        field: entry.field,
        id: entry.location.id,
        coordinates: origin.join(','),
        mode: entry.edit.isoline_here.mode,
        type: entry.edit.isoline_here.type,
        rangetype: entry.edit.isoline_here.rangetype,
        minutes: entry.edit.isoline_here.minutes,
        distance: entry.edit.isoline_here.distance,
        meta: entry.edit.isoline_here.meta || null,
        token: _xyz.token
      }));

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';

    xhr.onload = e => {

      if (e.target.status === 406) {
        return alert(e.target.responseText);
      }

      if (e.target.status !== 200) {
        console.log(e.target.response);
        return alert('No route found. Try alternative set up.');
      }

      entry.location.infoj = e.target.response;

      // Update the location view.
      _xyz.locations.view.create(entry.location);

      //entry.location.flyTo();

    };

    xhr.send();

  }

};