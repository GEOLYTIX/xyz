export default _xyz => layer => {

  if (typeof (layer.edit.isoline_mapbox) !== 'object') layer.edit.isoline_mapbox = {};

  const container = _xyz.utils.html.node`<div>`;

  const group = _xyz.utils.html.node`
      <div
        class="drawer group panel expandable">
      <div
        class="header primary-colour"
        style="text-align: left;"
        onclick=${e => {
      _xyz.utils.toggleExpanderParent(e.target);
    }
    }><span>${_xyz.language.mapbox_isoline_settings}</span>
      <span class="xyz-icon btn-header icon-expander primary-colour-filter">`;

  layer.edit.isoline_mapbox.profile = layer.edit.isoline_mapbox.profile || 'driving';
  layer.edit.isoline_mapbox.minutes = layer.edit.isoline_mapbox.minutes || 10;

  const modes = [
    { [_xyz.language.mapbox_driving]: 'driving' },
    { [_xyz.language.mapbox_walking]: 'walking' },
    { [_xyz.language.mapbox_cycling]: 'cycling' },
  ]

  layer.edit.isoline_mapbox.profile = 'driving';

  group.appendChild(_xyz.utils.html.node`
    <div
        style="margin-top: 8px; display: grid; grid-template-columns: 50px 1fr; align-items: center;">
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
                <li onclick=${e => {
          const drop = e.target.closest('.btn-drop');
          drop.classList.toggle('active');
          drop.querySelector(':first-child').textContent = Object.keys(keyVal)[0];

          layer.edit.isoline_mapbox.profile = Object.values(keyVal)[0];

        }}>${Object.keys(keyVal)[0]}`)}`);

  group.appendChild(_xyz.utils.html.node`
    <div style="margin-top: 12px;">
        <span>${_xyz.language.mapbox_travel_time}</span>
        <span class="bold">${layer.edit.isoline_mapbox.minutes}</span>
        <div class="input-range">
        <input
        class="secondary-colour-bg"
        type="range"
        min=5
        value=${layer.edit.isoline_mapbox.minutes}
        max=60
        step=1
        oninput=${e => {
      layer.edit.isoline_mapbox.minutes = parseInt(e.target.value);
      e.target.parentNode.previousElementSibling.textContent = layer.edit.isoline_mapbox.minutes;
    }}>`);


  container.appendChild(group);

  // Add state button to init drawing.
  container.appendChild(_xyz.utils.html.node`
    <button
        class="btn-wide primary-colour"
        onclick=${e => {

      e.stopPropagation();
      const btn = e.target;

      if (btn.classList.contains('active')) return _xyz.mapview.interaction.draw.cancel();

      btn.classList.add('active');
      layer.show();
      layer.view.querySelector('.header').classList.add('edited', 'secondary-colour-bg');

      _xyz.mapview.interaction.draw.begin({
        layer: layer,
        type: 'Point',
        geometryFunction: function (coordinates, geometry) {

          geometry = new ol.geom.Circle(coordinates, layer.edit.isoline_mapbox.minutes * 1000);

          const origin = ol.proj.transform(coordinates, `EPSG:${_xyz.mapview.srid}`, 'EPSG:4326');

          const xhr = new XMLHttpRequest();

          xhr.open('GET', _xyz.host + '/api/provider/mapbox?' +
            _xyz.utils.paramString({
              url: `api.mapbox.com/isochrone/v1/mapbox/${layer.edit.isoline_mapbox.profile || 'driving'}/${origin.join(',')}?`,
              contours_minutes: layer.edit.isoline_mapbox.minutes,
              generalize: layer.edit.isoline_mapbox.minutes,
              polygons: true
            }));

          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.responseType = 'json';

          xhr.onload = e => {

            if (e.target.status !== 200 || !e.target.response.features) return alert('No route found. Try a longer travel time or alternative setup.');

            _xyz.mapview.interaction.draw.feature({
              geometry: e.target.response.features[0].geometry,
              dataProjection: 'EPSG:4326'
            });

          };

          xhr.send();

          return geometry;
        },
        callback: () => {
          layer.view.querySelector('.header').classList.remove('edited', 'secondary-colour-bg');
          btn.classList.remove('active');
        }
      });

    }}>${_xyz.language.layer_draw_isoline_mapbox}`);

  return container;

}