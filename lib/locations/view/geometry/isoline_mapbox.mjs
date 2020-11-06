export default _xyz => {

  return {

    create: create,

    settings: settings

  }

  function settings(entry) {

    if (entry.edit.isoline_mapbox && !entry.edit.isoline_mapbox.geometry && (entry.edit.isoline_mapbox.minutes || (!entry.edit.isoline_mapbox.minutes && entry.value))) return _xyz.utils.html.node`<div>`;

    if (entry.edit.isoline_mapbox && entry.edit.isoline_mapbox.geometry && entry.edit.isoline_mapbox.minutes && !entry.value) return _xyz.utils.html.node`<div>`;

     panel(entry);

    if (entry.edit.isoline_mapbox && entry.edit.isoline_mapbox.geometry && (entry.edit.isoline_mapbox.minutes || (!entry.edit.isoline_mapbox.minutes && entry.value))) {
      edit(entry);
      return entry.edit.panel;
    }

    entry.edit.isoline_mapbox.profile = entry.edit.isoline_mapbox.profile || 'driving';
    entry.edit.isoline_mapbox._minutes = entry.edit.isoline_mapbox.minutes || 10;

    const modes = [
      { [_xyz.language.mapbox_driving] : 'driving' },
      { [_xyz.language.mapbox_walking]: 'walking' },
      { [_xyz.language.mapbox_cycling]: 'cycling' },
    ];

    entry.edit.isoline_mapbox.profile = 'driving';  

    entry.edit.panel.appendChild(_xyz.utils.html.node`
    <div
      style="margin-top: 8px; grid-column: 1 / 3; align-items: center;">
        <span style="grid-column: 1;">${_xyz.language.mapbox_mode}</span>
        <div style="grid-column: 2;">
        <button class="btn-drop">
            <div
                class="head"
                onclick=${e => {
                    e.preventDefault();
                    e.target.parentElement.classList.toggle('active');
                }}>
                <span>${_xyz.language.mapbox_driving}</span>
                <div class="icon"></div>
            </div>
            <ul>
                ${modes.map(
                keyVal => _xyz.utils.html.node`
                <li onclick=${e=>{
                    const drop = e.target.closest('.btn-drop');
                    drop.classList.toggle('active');
                    drop.querySelector(':first-child').textContent = Object.keys(keyVal)[0];
        
                    entry.edit.isoline_mapbox.profile = Object.values(keyVal)[0];
        
                }}>${Object.keys(keyVal)[0]}`)}`);
    
    entry.edit.panel.appendChild(_xyz.utils.html.node`
    <div style="margin-top: 12px; grid-column: 1 / 3;">
      <span>${_xyz.language.mapbox_travel_time} </span>
      <span class="bold">${entry.edit.isoline_mapbox._minutes}</span>
      <div class="input-range">
      <input
        class="secondary-colour-bg"
        type="range"
        min=5
        value=${entry.edit.isoline_mapbox._minutes}
        max=60
        step=1
        oninput=${e=>{
          entry.edit.isoline_mapbox._minutes = parseInt(e.target.value);
          e.target.parentNode.previousElementSibling.textContent = entry.edit.isoline_mapbox._minutes;
        }}>`);

    return entry.edit.panel;
  }

  function create(entry) {

    const origin = entry.location.geometry.coordinates;

    const xhr = new XMLHttpRequest();

    xhr.open('GET', _xyz.host +
      '/api/location/edit/isoline/mapbox?' +
      _xyz.utils.paramString({
        locale: _xyz.locale.key,
        layer: entry.location.layer.key,
        table: entry.location.table,
        coordinates: origin.join(','),
        minutes: entry.edit.isoline_mapbox._minutes || entry.edit.isoline_mapbox.minutes,
        profile: entry.edit.isoline_mapbox.profile,
        meta: entry.edit.isoline_mapbox.meta || null
      }));

    xhr.open('GET', _xyz.host + '/api/provider/mapbox?' +
      _xyz.utils.paramString({
        url: `api.mapbox.com/isochrone/v1/mapbox/${entry.edit.isoline_mapbox.profile || 'driving'}/${origin.join(',')}?`,
        contours_minutes: entry.edit.isoline_mapbox._minutes || entry.edit.isoline_mapbox.minutes,
        generalize: entry.edit.isoline_mapbox._minutes || entry.edit.isoline_mapbox.minutes,
        polygons: true
      }));

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';

    xhr.onload = e => {

      if (e.target.status !== 200 || !e.target.response.features) {
        entry.location.view && entry.location.view.classList.remove('disabled');
        console.log(e.target.response);
        return alert(_xyz.language.mapbox_error);
      }

      entry.newValue = e.target.response.features[0].geometry;

      if(entry.edit.isoline_mapbox.meta) {

        let date = new Date();

        entry.location.infoj
        .filter(_entry => _entry.type === 'meta' && _entry.field === entry.edit.isoline_mapbox.meta)
        .forEach(meta => meta.newValue = {
          [_xyz.language.mapbox_recent]: "Mapbox",
          [_xyz.language.mapbox_mode]: entry.edit.isoline_mapbox.profile,
          [_xyz.language.mapbox_minutes]: entry.edit.isoline_mapbox._minutes,
          [_xyz.language.mapbox_created]: `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${date.getMinutes() > 8 ? date.getMinutes()+1 : `0${date.getMinutes()+1}`}`
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
  
  }

  function edit(entry){

    panel(entry);

    if(entry.edit.edit) return;

    entry.edit.edit = _xyz.utils.html.node`
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
          
          }}>${_xyz.language.layer_draw_edit}`;

          entry.edit.panel.appendChild(entry.edit.edit);

  }

  function panel(entry){

    if(entry.edit.panel) return;

    entry.edit.panel = _xyz.utils.html.node`
    <div
      class="${`drawer group panel expandable ${entry.class || ''}`}"
      style="display: grid; grid-column: 1 / 3;">
      <div
        class="header primary-colour"
        style="text-align: left; grid-column: 1 / 3;"
          onclick=${e => {
            _xyz.utils.toggleExpanderParent(e.target);
          }}
          ><span>${_xyz.language.mapbox_isoline_settings}</span>
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

};