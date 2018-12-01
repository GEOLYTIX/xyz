import _xyz from './_xyz.mjs';

export default () => {

  // Create gazetteer object.
  _xyz.gazetteer = {
    icon: _xyz.utils.svg_symbols({type: 'markerColor', style: {colorMarker: '#64dd17', colorDot: '#33691e'}}),
    style: {
      stroke: true,
      color: '#090',
      weight: 2,
      fillColor: '#cf9',
      fillOpacity: 0.2,
      fill: true
    },
    toggle: document.getElementById('btnGazetteer'),
    group: document.getElementById('Gazetteer'),
    input: document.querySelector('#Gazetteer > input'),
    clear: document.querySelector('#Gazetteer .clear'),
    loader: document.querySelector('#Gazetteer > .loader'),
    result: document.querySelector('#Gazetteer > ul'),
  };

  // Gazetteer init which is called on change of locale.
  _xyz.gazetteer.init = () => {

    // Hide gazetteer button if no gazetteer is set for the locale.
    if (!_xyz.ws.locales[_xyz.locale].gazetteer) {
      _xyz.gazetteer.toggle.classList.remove('active');
      _xyz.gazetteer.toggle.style.display = 'none';
      _xyz.gazetteer.group.style.display = 'none';
      return;

    } else {
      _xyz.gazetteer.toggle.style.display = 'block';
    }

    // Empty input value, results and set placeholder.
    _xyz.gazetteer.input.value = '';
    _xyz.gazetteer.input.placeholder = _xyz.ws.locales[_xyz.locale].gazetteer.placeholder || '';
    _xyz.gazetteer.result.innerHTML = '';

    // Remove existing layer if exists
    if (_xyz.gazetteer.layer) _xyz.map.removeLayer(_xyz.gazetteer.layer);

  };
  _xyz.gazetteer.init();


  // Toggle visibility of the gazetteer group
  _xyz.gazetteer.toggle.addEventListener('click', e => {
    e.target.classList.toggle('active');
    _xyz.gazetteer.group.style.display =
            _xyz.gazetteer.group.style.display === 'block' ? 'none' : 'block';

    if (_xyz.gazetteer.group.style.display === 'block') _xyz.gazetteer.input.focus();
  });

  // Toggle visibility of the gazetteer group
  if (_xyz.gazetteer.clear) _xyz.gazetteer.clear.addEventListener('click', () => _xyz.gazetteer.input.value = '');

  // Initiate search on keyup with input value
  _xyz.gazetteer.input.addEventListener('keyup', e => {
    let key = e.keyCode || e.charCode,
      term = e.target.value;

    if (key !== 37 && key !== 38 && key !== 39 && key !== 40 && key !== 13 && term.length > 0 && isNaN(term.value)) {

      //initiate search if either split value is not a number
      let NaN_check = e.target.value.split(',').map(isNaN);
      if (_xyz.gazetteer.xhr) _xyz.gazetteer.xhr.abort();
      if (NaN_check[0] || NaN_check[1]) search(term);
    }
  });

  // Keydown events
  _xyz.gazetteer.input.addEventListener('keydown', e => {
    let key = e.keyCode || e.charCode,
      results = _xyz.gazetteer.result.querySelectorAll('li');

    // Move up through results with up key
    if (key === 38) {
      let i = _xyz.utils.indexInParent(_xyz.gazetteer.result.querySelector('.active'));
      if (i > 0) [results[i], results[i - 1]].forEach(el => el.classList.toggle('active'));
      return;
    }

    // Move down through results with down key
    if (key === 40) {
      let i = _xyz.utils.indexInParent(_xyz.gazetteer.result.querySelector('.active'));
      if (i < results.length - 1) [results[i], results[i + 1]].forEach(el => el.classList.toggle('active'));
      return;
    }

    // Cancel search and set results to empty on backspace or delete keydown
    if (key === 46 || key === 8) {
      if (_xyz.gazetteer.xhr) _xyz.gazetteer.xhr.abort();
      _xyz.gazetteer.result.innerHTML = '';
      if (_xyz.gazetteer.layer) _xyz.map.removeLayer(_xyz.gazetteer.layer);
      return;
    }

    // Select first result on enter keypress
    if (key === 13) {

      // Get possible coordinates from input and draw location if valid
      let latlng = e.target.value.split(',').map(parseFloat);
      if ((latlng[1] > -90 && latlng[1] < 90) && (latlng[0] > -180 && latlng[0] < 180)) {
        _xyz.gazetteer.result.innerHTML = '';
        createFeature({
          type: 'Point',
          coordinates: [latlng[1], latlng[0]]
        });
      }

      // Select active results record
      let activeRecord = results[_xyz.utils.indexInParent(_xyz.gazetteer.result.querySelector('.active'))];

      if (!activeRecord && results.length > 0) activeRecord = results[0];

      if (activeRecord['data-id']) select(activeRecord);

      return;
    }
  });

  // Click event for results list
  _xyz.gazetteer.result.addEventListener('click', e => {
    if (!e.target['data-source']) return;
    if (e.target['data-id']) select(e.target);
  });

  // Cancel search and empty results on input focusout
  _xyz.gazetteer.input.addEventListener('focusout', () => {
    if (_xyz.gazetteer.xhr) _xyz.gazetteer.xhr.abort();
    setTimeout(() => _xyz.gazetteer.result.innerHTML = '', 400);
  });

  // Initiate search request
  function search(term) {

    // Show loader while waiting for results from XHR.
    _xyz.gazetteer.loader.style.display = 'block';
    _xyz.gazetteer.result.innerHTML = '';

    // Create abortable xhr.
    _xyz.gazetteer.xhr = new XMLHttpRequest();

    // Send gazetteer query to backend.
    _xyz.gazetteer.xhr.open('GET', _xyz.host + '/api/gazetteer/autocomplete?' + _xyz.utils.paramString({
      locale: _xyz.locale,
      q: encodeURIComponent(term),
      token: _xyz.token
    }));

    _xyz.gazetteer.xhr.onload = e => {

      // Hide loader.
      _xyz.gazetteer.loader.style.display = 'none';

      // List results or show that no results were found
      if (e.target.status !== 200) return;
      
      // Parse the response as JSON and check for results length.
      let json = JSON.parse(e.target.responseText);
      if (json.length === 0) {
        _xyz.utils.createElement({
          tag: 'li',
          options: { textContent: 'No results for this search.' },
          style: { padding: '5px 0' },
          appendTo: _xyz.gazetteer.result
        });
        return;
      }

      // Add results from JSON to _xyz.gazetteer.
      for (let key in json) {
        _xyz.utils.createElement({
          tag: 'li',
          options: {
            textContent: json[key].label,
            'data-id': json[key].id,
            'data-layer': json[key].layer || '',
            'data-table': json[key].table || '',
            'data-marker': json[key].marker || '',
            'data-source': json[key].source
          },
          appendTo: _xyz.gazetteer.result
        });
      }
    };

    _xyz.gazetteer.xhr.send();
  }

  function select(record) {
    _xyz.gazetteer.result.innerHTML = '';
    _xyz.gazetteer.input.value = record.innerText;
  
    if (record['data-source'] === 'glx') {
      _xyz.locations.select({
        layer: record['data-layer'],
        table: record['data-table'],
        id: record['data-id'],
        marker: record['data-marker'].split(',')
      });
      return;
    }
  
    if (record['data-source'] === 'mapbox') {
      createFeature({
        type: 'Point',
        coordinates: record['data-marker']
      });
      return;
    }
  
    if (record['data-source'] === 'google') {
  
      // Get the geometry from the gazetteer database.
      let xhr = new XMLHttpRequest();
  
      xhr.open('GET', _xyz.host + '/api/gazetteer/googleplaces?id=' + record['data-id'] + '&token=' + _xyz.token);
  
      xhr.onload = e => {
  
        // Send results to createFeature
        if (e.target.status === 200) createFeature(JSON.parse(e.target.responseText));
  
      };
      xhr.send();
    }
  }

  // Create a feature from geojson
  function createFeature(geom) {

    // Parse json if geom is string
    geom = typeof (geom) === 'string' ? JSON.parse(geom) : geom;

    // Remove existing layer.
    if (_xyz.gazetteer.layer) _xyz.map.removeLayer(_xyz.gazetteer.layer);

    // Add layer to map.
    _xyz.gazetteer.layer = L.geoJson(geom, {
      interactive: false,
      pane: 'gazetteer',
      pointToLayer: function (feature, latlng) {
        return new L.Marker(latlng, {
          interactive: false,
          pane: 'gazetteer',
          icon: L.icon({
            iconUrl: _xyz.gazetteer.icon,
            iconSize: [40, 40],
            iconAnchor: [20, 40]
          })
        });
      },
      style: _xyz.gazetteer.style
    }).addTo(_xyz.map);

    // Zoom to the extent of the gazetteer layer
    _xyz.map.fitBounds(_xyz.gazetteer.layer.getBounds());
  }

};