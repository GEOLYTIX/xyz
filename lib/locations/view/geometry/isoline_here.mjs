export default _xyz => {

  return {

    create: create,

    settings: settings,

  }

  function settings(entry) {

    if (entry.edit.isoline_here && (entry.edit.isoline_here.minutes || (!entry.edit.isoline_here.minutes && entry.value))) return _xyz.utils.wire()`<div>`;
    
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

    entry.edit.isoline_here._minutes = entry.edit.isoline_here.minutes || 10;
    entry.edit.isoline_here._distance = entry.edit.isoline_here.distance || 10;

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
                        entry.edit.isoline_here._minutes = parseInt(e.target.value);
                        e.target.parentNode.previousElementSibling.textContent = entry.edit.isoline_here._minutes;
                      };
              
                      input.value = entry.edit.isoline_here._minutes;
                      input.parentNode.previousElementSibling.textContent = entry.edit.isoline_here._minutes;
                    
                    }
              
                    if(entry.edit.isoline_here.rangetype === 'distance') {
              
                      slider_here_range.querySelector('span').textContent = 'Travel distance in kilometer: ';
              
                      input.oninput = e => {
                        entry.edit.isoline_here._distance = parseInt(e.target.value);
                        e.target.parentNode.previousElementSibling.textContent = entry.edit.isoline_here._distance;
                      };
                      input.value = entry.edit.isoline_here._distance;
                      input.parentNode.previousElementSibling.textContent = entry.edit.isoline_here._distance;
                    }
        
                }}>${Object.keys(keyVal)[0]}`)}`);    

    const slider_here_range = _xyz.utils.wire()`
    <div style="margin-top: 12px;">
        <span>Travel time in minutes: </span>
        <span class="bold">${entry.edit.isoline_here._minutes}</span>
        <div class="input-range">
        <input
          class="secondary-colour-bg"
          type="range"
          min=5
          value=${entry.edit.isoline_here._minutes}
          max=60
          step=1
          oninput=${e=>{
            entry.edit.isoline_here._minutes = parseInt(e.target.value);
            e.target.parentNode.previousElementSibling.textContent = entry.edit.isoline_here._minutes;
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

    const range = entry.edit.isoline_here.rangetype === 'time' || !entry.edit.isoline_here.rangetype ?
    (entry.edit.isoline_here._minutes || entry.edit.isoline_here.minutes || 10) * 60 || 600 :
    entry.edit.isoline_here.rangetype === 'distance' ?
      (entry.edit.isoline_here._distance || 1) * 1000 || 1000 :
      600;

    xhr.open('GET', _xyz.host + '/api/provider/here?' +
      _xyz.utils.paramString({
        url: 'isoline.route.api.here.com/routing/7.2/calculateisoline.json?',
        mode: `${entry.edit.isoline_here.type || 'fastest'};${entry.edit.isoline_here.mode || 'car'};traffic:disabled`,
        start: `geo!${origin.join(',')}`,
        range: range,
        rangetype: entry.edit.isoline_here.rangetype || 'time',
        token: _xyz.token
      }));

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';

    xhr.onload = e => {

      if (e.target.status !== 200 || !e.target.response.response) {
        entry.location.view && entry.location.view.classList.remove('disabled');
        console.log(e.target.response);
        return alert('No route found. Try alternative set up.');
      }

      entry.newValue = {
        'type': 'Polygon',
        'coordinates': [e.target.response.response.isoline[0].component[0].shape.map(el => el.split(',').reverse())]
      };

      entry.location.update();

    };

    xhr.send();

    entry.location.view && entry.location.view.classList.add('disabled');

  };

};