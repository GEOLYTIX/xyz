import _xyz from './_xyz.mjs';

export default () => {

  // Declare DOM elements
  const dom = {
    btnSearch: document.getElementById('btnGazetteer'),
    group: document.getElementById('Gazetteer'),
    input: document.querySelector('#Gazetteer > input'),
    clear: document.querySelector('#Gazetteer .clear'),
    loader: document.querySelector('#Gazetteer > .loader'),
    result: document.querySelector('#Gazetteer > ul')
  };

  // Set gazetteer defaults if missing from appSettings.
  if (!_xyz.ws.gazetteer) _xyz.ws.gazetteer = {};
  if (!_xyz.ws.gazetteer.icon) _xyz.ws.gazetteer.icon = _xyz.utils.svg_symbols({type: 'markerColor', style: {colorMarker: '#64dd17', colorDot: '#33691e'}});
  if (!_xyz.ws.gazetteer.pane) _xyz.ws.gazetteer.pane = 550;
  if (!_xyz.ws.gazetteer.style) _xyz.ws.gazetteer.style = {
    stroke: true,
    color: '#090',
    weight: 2,
    fillColor: '#cf9',
    fillOpacity: 0.2,
    fill: true
  };

  // Create the gazetteer pane.
  _xyz.map.createPane('gazetteer');
  _xyz.map.getPane('gazetteer').style.zIndex = _xyz.ws.gazetteer.pane;

  // Gazetteer init which is called on change of locale.
  _xyz.ws.gazetteer.init = () => {

    // Hide gazetteer button if no gazetteer is set for the locale.
    if (!_xyz.ws.locales[_xyz.locale].gazetteer) {
      dom.btnSearch.classList.remove('active');
      dom.btnSearch.style.display = 'none';
      dom.group.style.display = 'none';
      return;

    } else {
      dom.btnSearch.style.display = 'block';
    }

    // Empty input value, results and set placeholder.
    dom.input.value = '';
    dom.input.placeholder = _xyz.ws.locales[_xyz.locale].gazetteer.placeholder || '';
    dom.result.innerHTML = '';

    // Remove existing layer if exists
    if (_xyz.ws.gazetteer.layer) _xyz.map.removeLayer(_xyz.ws.gazetteer.layer);
  };
  _xyz.ws.gazetteer.init();

  // Toggle visibility of the gazetteer group
  dom.btnSearch.addEventListener('click', e => {
    e.target.classList.toggle('active');
    dom.group.style.display =
            dom.group.style.display === 'block' ? 'none' : 'block';

    if (dom.group.style.display === 'block') dom.input.focus();
  });

  // Toggle visibility of the gazetteer group
  if (dom.clear) dom.clear.addEventListener('click', () => dom.input.value = '');

  // Initiate search on keyup with input value
  dom.input.addEventListener('keyup', e => {
    let key = e.keyCode || e.charCode,
      val = e.target.value;

    if (key !== 37 && key !== 38 && key !== 39 && key !== 40 && key !== 13 && val.length > 0 && isNaN(val.value)) {

      //initiate search if either split value is not a number
      let NaN_check = e.target.value.split(',').map(isNaN);
      if (_xyz.ws.gazetteer.xhrSearch) _xyz.ws.gazetteer.xhrSearch.abort();
      if (NaN_check[0] || NaN_check[1]) initiateSearch(val, dom);
    }
  });

  // Keydown events
  dom.input.addEventListener('keydown', e => {
    let key = e.keyCode || e.charCode,
      results = dom.result.querySelectorAll('li');

    // Move up through results with up key
    if (key === 38) {
      let i = _xyz.utils.indexInParent(dom.result.querySelector('.active'));
      if (i > 0) [results[i], results[i - 1]].forEach(el => el.classList.toggle('active'));
    }

    // Move down through results with down key
    if (key === 40) {
      let i = _xyz.utils.indexInParent(dom.result.querySelector('.active'));
      if (i < results.length - 1) [results[i], results[i + 1]].forEach(el => el.classList.toggle('active'));
    }

    // Cancel search and set results to empty on backspace or delete keydown
    if (key === 46 || key === 8) {
      if (_xyz.ws.gazetteer.xhrSearch) _xyz.ws.gazetteer.xhrSearch.abort();
      dom.result.innerHTML = '';
      if (_xyz.ws.gazetteer.layer) _xyz.map.removeLayer(_xyz.ws.gazetteer.layer);
    }

    // Select first result on enter keypress
    if (key === 13) {

      // Get possible coordinates from input and draw location if valid
      let latlng = e.target.value.split(',').map(parseFloat);
      if ((latlng[1] > -90 && latlng[1] < 90) && (latlng[0] > -180 && latlng[0] < 180)) {
        dom.result.innerHTML = '';
        createFeature({
          type: 'Point',
          coordinates: [latlng[1], latlng[0]]
        });
      }

      // Select active results record
      let activeRecord = results[_xyz.utils.indexInParent(dom.result.querySelector('.active'))];

      if (!activeRecord && results.length > 0) activeRecord = results[0];

      if (activeRecord['data-id']) selectResult(activeRecord, dom);
    }
  });

  // Click event for results list
  dom.result.addEventListener('click', e => {
    if (!e.target['data-source']) return;
    if (e.target['data-id']) selectResult(e.target, dom);
  });

  // Cancel search and empty results on input focusout
  dom.input.addEventListener('focusout', () => {
    if (_xyz.ws.gazetteer.xhrSearch) _xyz.ws.gazetteer.xhrSearch.abort();
    setTimeout(() => dom.result.innerHTML = '', 400);
  });
};

// Initiate search request
function initiateSearch(searchValue, dom) {

  // Show loader while waiting for results from XHR.
  dom.loader.style.display = 'block';
  dom.result.innerHTML = '';

  _xyz.ws.gazetteer.xhrSearch = new XMLHttpRequest();
  _xyz.ws.gazetteer.xhrSearch.open('GET', _xyz.host + '/api/gazetteer/autocomplete?' + _xyz.utils.paramString({
    locale: _xyz.locale,
    q: encodeURIComponent(searchValue),
    token: _xyz.token
  }));

  _xyz.ws.gazetteer.xhrSearch.onload = e => {

    dom.loader.style.display = 'none';

    // catch error here.

    // List results or show that no results were found
    if (e.target.status === 200) {
      let json = JSON.parse(e.target.responseText);

      if (json.length === 0) {
        _xyz.utils.createElement({
          tag: 'li',
          options: { textContent: 'No results for this search.' },
          style: { padding: '5px 0' },
          appendTo: dom.result
        });
        return;
      }

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
          appendTo: dom.result
        });
      }
    }
  };
  _xyz.ws.gazetteer.xhrSearch.send();
}

function selectResult(record, dom) {
  dom.result.innerHTML = '';
  dom.input.value = record.innerText;

  if (record['data-source'] === 'glx') {
    _xyz.ws.select.selectLayerFromEndpoint({
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

  // Add geometry to the gazetteer layer
  if (_xyz.ws.gazetteer.layer) _xyz.map.removeLayer(_xyz.ws.gazetteer.layer);
  _xyz.ws.gazetteer.layer = L.geoJson(geom, {
    interactive: false,
    pane: 'gazetteer',
    pointToLayer: function (feature, latlng) {
      return new L.Marker(latlng, {
        interactive: false,
        pane: 'gazetteer',
        icon: L.icon({
          iconUrl: _xyz.ws.gazetteer.icon,
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        })
      });
    },
    style: _xyz.ws.gazetteer.style
  }).addTo(_xyz.map);

  // Zoom to the extent of the gazetteer layer
  _xyz.map.fitBounds(_xyz.ws.gazetteer.layer.getBounds());
}