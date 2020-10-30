export default _xyz => layer => {

  if (typeof (layer.edit.isoline_here) !== 'object') layer.edit.isoline_here = {};

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
    }><span>${_xyz.language.here_isoline_settings}</span>
      <span class="xyz-icon btn-header icon-expander primary-colour-filter">`;

  layer.edit.isoline_here.minutes = layer.edit.isoline_here.minutes || 10;
  layer.edit.isoline_here.distance = layer.edit.isoline_here.distance || 10;

  const modes = [
    { [_xyz.language.here_driving]: 'car' },
    { [_xyz.language.here_walking]: 'pedestrian' },
    { [_xyz.language.here_cargo]: 'truck' },
    { [_xyz.language.here_hov_lane]: 'carHOV' }
  ];

  layer.edit.isoline_here.mode = 'car';

  group.appendChild(_xyz.utils.html.node`
    <div
        style="margin-top: 8px; display: grid; grid-template-columns: 50px 1fr; align-items: center;">
        <span style="grid-column: 1;">${_xyz.language.here_mode}</span>
        <div style="grid-column: 2;">
        <button class="btn-drop">
            <div
                class="head"
                onclick=${e => {
      e.preventDefault();
      e.target.parentElement.classList.toggle('active');
    }}>
                <span>${_xyz.language.here_driving}</span>
                <div class="icon"></div>
            </div>
            <ul>
                ${modes.map(
      keyVal => _xyz.utils.html.node`
                <li onclick=${e => {
          const drop = e.target.closest('.btn-drop');
          drop.classList.toggle('active');
          drop.querySelector(':first-child').textContent = Object.keys(keyVal)[0];

          layer.edit.isoline_here.mode = Object.values(keyVal)[0];

        }}>${Object.keys(keyVal)[0]}`)}`);


  const ranges = [
    { [_xyz.language.here_time]: "time" },
    { [_xyz.language.here_distance]: "distance" }
  ]

  layer.edit.isoline_here.rangetype = 'time';

  group.appendChild(_xyz.utils.html.node`
    <div
        style="margin-top: 8px; display: grid; grid-template-columns: 50px 1fr; align-items: center;">
        <span style="grid-column: 1;">${_xyz.language.here_range}</span>
        <div style="grid-column: 2;">
        <button class="btn-drop">
            <div
                class="head"
                onclick=${e => {
      e.preventDefault();
      e.target.parentElement.classList.toggle('active');
    }}>
                <span>${_xyz.language.here_time}</span>
                <div class="icon"></div>
            </div>
            <ul>
                ${ranges.map(
      keyVal => _xyz.utils.html.node`
                <li onclick=${e => {
          const drop = e.target.closest('.btn-drop');
          drop.classList.toggle('active');
          drop.querySelector(':first-child').textContent = Object.keys(keyVal)[0];

          layer.edit.isoline_here.rangetype = Object.values(keyVal)[0];

          const input = slider_here_range.querySelector('input');

          if (layer.edit.isoline_here.rangetype === 'time') {

            slider_here_range.querySelector('span').textContent =  _xyz.language.here_travel_time;

            input.oninput = e => {
              layer.edit.isoline_here.minutes = parseInt(e.target.value);
              e.target.parentNode.previousElementSibling.textContent = layer.edit.isoline_here.minutes;
            };

            input.value = layer.edit.isoline_here.minutes;
            input.parentNode.previousElementSibling.textContent = layer.edit.isoline_here.minutes;

          }

          if (layer.edit.isoline_here.rangetype === 'distance') {

            slider_here_range.querySelector('span').textContent = _xyz.language.here_travel_distance;

            input.oninput = e => {
              layer.edit.isoline_here.distance = parseInt(e.target.value);
              e.target.parentNode.previousElementSibling.textContent = layer.edit.isoline_here.distance;
            };
            input.value = layer.edit.isoline_here.distance;
            input.parentNode.previousElementSibling.textContent = layer.edit.isoline_here.distance;
          }

        }}>${Object.keys(keyVal)[0]}`)}`);

  const slider_here_range = _xyz.utils.html.node`
    <div style="margin-top: 12px;">
        <span>${_xyz.language.here_travel_time}</span>
        <span class="bold">${layer.edit.isoline_here.minutes}</span>
        <div class="input-range">
        <input
        class="secondary-colour-bg"
        type="range"
        min=5
        value=${layer.edit.isoline_here.minutes}
        max=60
        step=1
        oninput=${e => {
      layer.edit.isoline_here.minutes = parseInt(e.target.value);
      e.target.parentNode.previousElementSibling.textContent = layer.edit.isoline_here.minutes;
    }}>`

  group.appendChild(slider_here_range);


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

          geometry = new ol.geom.Circle(coordinates, layer.edit.isoline_here.minutes * 1000);

          const origin = ol.proj.transform(coordinates, `EPSG:${_xyz.mapview.srid}`, 'EPSG:4326');

          const xhr = new XMLHttpRequest();

          const range = layer.edit.isoline_here.rangetype === 'time' ?
            (layer.edit.isoline_here.minutes || 10) * 60 || 600 :
            layer.edit.isoline_here.rangetype === 'distance' ?
              (layer.edit.isoline_here.distance || 1) * 1000 || 1000 :
              600

          xhr.open('GET', _xyz.host + '/api/provider/here?' +
            _xyz.utils.paramString({
              url: 'isoline.route.api.here.com/routing/7.2/calculateisoline.json?',
              mode: `${layer.edit.isoline_here.type || 'fastest'};${layer.edit.isoline_here.mode || 'car'};traffic:disabled`,
              start: `geo!${origin.reverse().join(',')}`,
              range: range,
              rangetype: layer.edit.isoline_here.rangetype || 'time'
            }));

          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.responseType = 'json';

          xhr.onload = e => {

            if (e.target.status !== 200 || !e.target.response.response) return alert(_xyz.language.here_error);

            _xyz.mapview.interaction.draw.feature({
              geometry: {
                'type': 'Polygon',
                'coordinates': [e.target.response.response.isoline[0].component[0].shape.map(el => el.split(',').reverse())]
              },
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

    }}>${_xyz.language.layer_draw_isoline_here}`);

  return container;

}