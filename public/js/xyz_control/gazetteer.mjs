export default _xyz => {

  return {

    init: init,

    search: search,

    select: select,

    createFeature: createFeature,
    
  };

  // Create gazetteer object.
  function init (params) {

    if (_xyz.gazetteer.toggle) {
      _xyz.gazetteer.toggle.style.display = 'none';
      _xyz.gazetteer.toggle.classList.remove('active');
    }

    if (_xyz.gazetteer.group) {
      _xyz.gazetteer.group.remove();
    }

    if (!_xyz.workspace.locale.gazetteer) return;

    Object.assign(
      _xyz.gazetteer,
      {
        icon: _xyz.utils.svg_symbols({type: 'markerColor', style: {colorMarker: '#64dd17', colorDot: '#33691e'}}),
        style: {
          stroke: true,
          color: '#090',
          weight: 2,
          fillColor: '#cf9',
          fillOpacity: 0.2,
          fill: true
        }
      },
      params);

    _xyz.gazetteer.group = _xyz.utils.hyperHTML.wire()`<div class="gazetteer input_group">`;
    _xyz.gazetteer.target.appendChild(_xyz.gazetteer.group);

    _xyz.gazetteer.input = _xyz.utils.hyperHTML.wire()`<input type="text" required placeholder=${_xyz.workspace.locale.gazetteer.placeholder || ''}>`;
    _xyz.gazetteer.group.appendChild(_xyz.gazetteer.input);
    _xyz.gazetteer.group.appendChild(_xyz.utils.hyperHTML.wire()`<span class="bar">`);

    // Initiate search on keyup with input value
    _xyz.gazetteer.input.addEventListener('keyup', e => {
      
      let
        key = e.keyCode || e.charCode,
        term = e.target.value;
    
      if (
        key !== 37 && 
            key !== 38 && 
            key !== 39 && 
            key !== 40 && 
            key !== 13 && 
            term.length > 0 && 
            isNaN(term.value)) {
    
        if (_xyz.gazetteer.xhr) _xyz.gazetteer.xhr.abort();
        search(term);
      }
    });
    
    // Keydown events
    _xyz.gazetteer.input.addEventListener('keydown', e => {
    
      let
        key = e.keyCode || e.charCode,
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
          if (_xyz.gazetteer.xhr) _xyz.gazetteer.xhr.abort();
          results = [];
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
    
    // Cancel search and empty results on input focusout
    _xyz.gazetteer.input.addEventListener('focusout', () => {
      if (_xyz.gazetteer.xhr) _xyz.gazetteer.xhr.abort();
      setTimeout(() => _xyz.gazetteer.result.innerHTML = '', 400);
    });    

    _xyz.gazetteer.loader = _xyz.utils.hyperHTML.wire()`<div class="loader" style="display: none;">`;
    _xyz.gazetteer.group.appendChild(_xyz.gazetteer.loader);

    _xyz.gazetteer.result = _xyz.utils.hyperHTML.wire()`<ul></ul>`;
    _xyz.gazetteer.group.appendChild(_xyz.gazetteer.result);

    // Click event for results list
    _xyz.gazetteer.result.addEventListener('click', e => {
      if (!e.target['data-source']) return;
      if (e.target['data-id']) select(e.target);
    });


    if (params.toggle) {
      _xyz.gazetteer.toggle = params.toggle;
      _xyz.gazetteer.toggle.style.display = 'block';
      _xyz.gazetteer.group.style.display = 'none';

      // Toggle visibility of the gazetteer group
      _xyz.gazetteer.toggle.onclick = () => {

        _xyz.gazetteer.toggle.classList.toggle('active');

        if (_xyz.gazetteer.group.style.display === 'block') {
          return _xyz.gazetteer.group.style.display = 'none';
        }

        _xyz.gazetteer.group.style.display = 'block';
        _xyz.gazetteer.input.focus();
      };
    }


    // Toggle visibility of the gazetteer group
    if (params.clear) {
      _xyz.gazetteer.clear = params.clear;
      _xyz.gazetteer.clear.addEventListener('click',
        () => _xyz.gazetteer.input.value = '');
    }
  };

  // Initiate search request.
  function search(term) {

  // Show loader while waiting for results from XHR.
    _xyz.gazetteer.loader.style.display = 'block';
    _xyz.gazetteer.result.innerHTML = '';

    // Create abortable xhr.
    _xyz.gazetteer.xhr = new XMLHttpRequest();

    // Send gazetteer query to backend.
    _xyz.gazetteer.xhr.open('GET', _xyz.host + '/api/gazetteer/autocomplete?' + _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      q: encodeURIComponent(term),
      token: _xyz.token
    }));

    _xyz.gazetteer.xhr.setRequestHeader('Content-Type', 'application/json');
    _xyz.gazetteer.xhr.responseType = 'json';

    _xyz.gazetteer.xhr.onload = e => {

    // Hide loader.
      _xyz.gazetteer.loader.style.display = 'none';

      // List results or show that no results were found
      if (e.target.status !== 200) return;
      
      // Parse the response as JSON and check for results length.
      const json = e.target.response;

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

  // Select location from search results.
  function select(record) {
    _xyz.gazetteer.result.innerHTML = '';
    _xyz.gazetteer.input.value = record.innerText;
  
    if (record['data-source'] === 'glx') {

      _xyz.locations.select({
        locale: _xyz.workspace.locale.key,
        layer: record['data-layer'],
        table: record['data-table'],
        id: record['data-id'],
        marker: record['data-marker'].split(',')
      }, true);

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
      const xhr = new XMLHttpRequest();
  
      xhr.open('GET', _xyz.host + '/api/gazetteer/googleplaces?id=' + record['data-id'] + '&token=' + _xyz.token);

      xhr.responseType = 'json';
  
      xhr.onload = e => {
  
      // Send results to createFeature
        if (e.target.status === 200) createFeature(e.target.response);
  
      };
      xhr.send();
    }
  }

  // Create a feature from geojson.
  function createFeature(geom) {

  // Parse json if geom is string
    geom = typeof (geom) === 'string' ? JSON.parse(geom) : geom;

    // Remove existing layer.
    if (_xyz.gazetteer.layer) _xyz.map.removeLayer(_xyz.gazetteer.layer);

    _xyz.gazetteer.layer = _xyz.mapview.draw.geoJSON({
      json: geom,
      pane: 'gazetteer',
      style: {
        icon: {
          url: _xyz.gazetteer.icon,
          size: 40,
          anchor: [20, 40]
        }
      }
    });

    // Zoom to the extent of the gazetteer layer
    _xyz.map.fitBounds(_xyz.gazetteer.layer.getBounds());
  }

};