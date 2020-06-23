export default _xyz => layer => {

  if (typeof (layer.edit.isoline_here) !== 'object') layer.edit.isoline_here = {};

  const container = _xyz.utils.wire()`<div>`;

  const group = _xyz.utils.wire()`
      <div
        class="drawer group panel expandable"
      style="max-height: 20px;">
      <div
        class="header primary-colour"
        style="text-align: left;"
        onclick=${e => {
      _xyz.utils.toggleExpanderParent(e.target);
    }
    }><span>Here Isoline settings</span>
      <span class="xyz-icon btn-header icon-expander primary-colour-filter">`;

  layer.edit.isoline_here.minutes = layer.edit.isoline_here.minutes || 10;
  layer.edit.isoline_here.distance = layer.edit.isoline_here.distance || 10;

  const modes = [
    { Driving: 'car' },
    { Walking: 'pedestrian' },
    { Cargo: 'truck' },
    { 'HOV lane': 'carHOV' }
  ];

  layer.edit.isoline_here.mode = 'car';

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
                <li onclick=${e => {
          const drop = e.target.closest('.btn-drop');
          drop.classList.toggle('active');
          drop.querySelector(':first-child').textContent = Object.keys(keyVal)[0];

          layer.edit.isoline_here.mode = Object.values(keyVal)[0];

        }}>${Object.keys(keyVal)[0]}`)}`);


  const ranges = [
    { "Time (min)": "time" },
    { "Distance (km)": "distance" }
  ]

  layer.edit.isoline_here.rangetype = 'time';

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
                <li onclick=${e => {
          const drop = e.target.closest('.btn-drop');
          drop.classList.toggle('active');
          drop.querySelector(':first-child').textContent = Object.keys(keyVal)[0];

          layer.edit.isoline_here.rangetype = Object.values(keyVal)[0];

          const input = slider_here_range.querySelector('input');

          if (layer.edit.isoline_here.rangetype === 'time') {

            slider_here_range.querySelector('span').textContent = 'Travel time in minutes: ';

            input.oninput = e => {
              layer.edit.isoline_here.minutes = parseInt(e.target.value);
              e.target.parentNode.previousElementSibling.textContent = layer.edit.isoline_here.minutes;
            };

            input.value = layer.edit.isoline_here.minutes;
            input.parentNode.previousElementSibling.textContent = layer.edit.isoline_here.minutes;

          }

          if (layer.edit.isoline_here.rangetype === 'distance') {

            slider_here_range.querySelector('span').textContent = 'Travel distance in kilometer: ';

            input.oninput = e => {
              layer.edit.isoline_here.distance = parseInt(e.target.value);
              e.target.parentNode.previousElementSibling.textContent = layer.edit.isoline_here.distance;
            };
            input.value = layer.edit.isoline_here.distance;
            input.parentNode.previousElementSibling.textContent = layer.edit.isoline_here.distance;
          }

        }}>${Object.keys(keyVal)[0]}`)}`);

  const slider_here_range = _xyz.utils.wire()`
    <div style="margin-top: 12px;">
        <span>Travel time in minutes: </span>
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
  container.appendChild(_xyz.utils.wire()`
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

          //var feature = new ol.Feature({ geometry: geometry });

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

            if (e.target.status !== 200 || !e.target.response.response) return alert('No route found. Try a longer travel time or alternative setup.');

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

    }}>Isoline Here`);

  return container;

}