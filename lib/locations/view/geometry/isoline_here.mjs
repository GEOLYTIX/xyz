export default _xyz => {

  return {

    create: create,

    settings: settings

  }

  function settings(entry) {

    if (entry.edit.isoline_here && !entry.edit.isoline_here.geometry && (entry.edit.isoline_here.minutes || (!entry.edit.isoline_here.minutes && entry.value))) return _xyz.utils.wire()`<div>`;

    if (entry.edit.isoline_here && entry.edit.isoline_here.geometry && entry.edit.isoline_here.minutes && !entry.value) return _xyz.utils.wire()`<div>`;

    panel(entry);

    if (entry.edit.isoline_here && entry.edit.isoline_here.geometry && (entry.edit.isoline_here.minutes || (!entry.edit.isoline_here.minutes && entry.value))) {
      edit(entry);
      return entry.edit.panel;
    }

    entry.edit.isoline_here._minutes = entry.edit.isoline_here.minute || 10;
    entry.edit.isoline_here._distance = entry.edit.isoline_here.distance || 10;

    const modes = [
      { Driving: 'car' },
      { Walking: 'pedestrian' },
      { Cargo: 'truck' },
      { 'HOV lane': 'carHOV' }
    ];

    entry.edit.isoline_here.mode = 'car';

    entry.edit.panel.appendChild(_xyz.utils.wire()`
    <div
        style="margin-top: 8px; grid-column: 1 / 3; display: grid; grid-template-columns: 50px 1fr; align-items: center;">
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
    
    entry.edit.panel.appendChild(_xyz.utils.wire()`
    <div
        style="margin-top: 8px; grid-column: 1 / 3; display: grid; grid-template-columns: 50px 1fr; align-items: center;">
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
    <div style="margin-top: 12px; grid-column: 1 / 3;">
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

    entry.edit.panel.appendChild(slider_here_range);

    return entry.edit.panel;
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
        rangetype: entry.edit.isoline_here.rangetype || 'time'
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

      if(entry.edit.isoline_here.meta) {

        let date = new Date();

        entry.location.infoj
        .filter(_entry => _entry.type === 'json' && _entry.field === entry.edit.isoline_here.meta)
        .forEach(meta => meta.newValue = {
          "Recent isoline": "Here",
          "Mode": entry.edit.isoline_here.mode,
          "Range type": entry.edit.isoline_here.rangetype,
          "Range": entry.edit.isoline_here.rangetype === 'time' ? entry.edit.isoline_here._minutes : entry.edit.isoline_here._distance,
          "Created": `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${date.getMinutes() > 8 ? date.getMinutes()+1 : `0${date.getMinutes()+1}`}`
        });


      }

      if(entry.edit.panel){
        entry.edit.panel.remove();
        entry.edit.panel = null;
        panel(entry);
      }
      
      entry.location.update();

    };

    xhr.send();

    entry.location.view && entry.location.view.classList.add('disabled');

  };

  function edit(entry){

    panel(entry);

    if(entry.edit.edit) return;

    entry.edit.edit = _xyz.utils.wire()`
      <div style="
      margin-top: 8px;
      grid-column: 1 / 3;
      display: grid;
      grid-template-columns: 50px 1fr;
      align-items: center;
      ">
      <div style="grid-column: 1 / span 3;">
      <button class="btn-wide primary-colour" style="font-size: x-small;"
      onclick=${ e => {

        e.stopPropagation();

        const btn = e.target;

        if (btn.classList.contains('active')) {
          btn.classList.remove('active');
          _xyz.mapview.interaction.edit.finish();
          return _xyz.map.removeLayer(entry.edit.feature);
        }

        btn.classList.add('active');

        entry.edit.feature = _xyz.mapview.geoJSON({ 
            geometry: typeof entry.value  === 'object' ? entry.value : JSON.parse(entry.value), 
            dataProjection: '4326'
          });

          _xyz.mapview.interaction.edit.begin({
            location: entry.location,
            type: 'Polygon',
            source: new ol.source.Vector({
              features: [entry.edit.feature.getSource().getFeatures()[0].clone()]
            }),
            callback: () => {
              btn.classList.remove('active');
              _xyz.map.removeLayer(entry.edit.feature);
            },
            update: () => update(entry)
          });
          
          }}>Edit`;

          entry.edit.panel.appendChild(entry.edit.edit);
  }

  function panel(entry){

    if(entry.edit.panel) return;

    entry.edit.panel = _xyz.utils.wire()`
    <div
    class="drawer group panel expandable ${entry.class || ''}"
    style="display: grid; grid-column: 1 / 3; max-height: 20px;">
    <div
    class="header primary-colour"
        style="text-align: left; grid-column: 1 / 3;"
        onclick=${e => {
          _xyz.utils.toggleExpanderParent(e.target);
        }}
        ><span>Here Isoline settings</span>
        <span class="xyz-icon btn-header icon-expander primary-colour-filter">`;

  }

  function update(entry){

    const features = _xyz.mapview.interaction.edit.Source.getFeatures();

    const geoJSON = new ol.format.GeoJSON();

    entry.newValue = JSON.parse(
      geoJSON.writeFeature(
        features[0],
        { 
          dataProjection: 'EPSG:' + entry.location.layer.srid,
          featureProjection: 'EPSG:' + _xyz.mapview.srid
        })).geometry;

      entry.location.update();

      _xyz.map.removeLayer(entry.edit.feature);

      _xyz.mapview.interaction.edit.finish();
    }

}