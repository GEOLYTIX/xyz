export default _xyz => {

  const gazetteer = {

    init: init,

    search: search,

    sources: {
      glx: glx,
      mapbox: mapbox,
      google: google,
      opencage: opencage
    },

    select: select,

    createFeature: createFeature,

    icon: {
      type: 'markerColor',
      colorMarker: '#64dd17',
      colorDot: '#33691e',
      anchor: [0.5, 1],
      scale: 2,
    },

  };

  return gazetteer;

  function init(params) {

    if (!params) return;

    Object.assign(gazetteer, params);

    // Results
    gazetteer.result = gazetteer.group.querySelector('ul');

    // Input
    gazetteer.input = gazetteer.group.querySelector('input');

    gazetteer.input.placeholder = _xyz.locale.gazetteer.placeholder || '';

    // Initiate search on keyup with input value
    gazetteer.input.addEventListener('keyup', e => {

      const keyset = new Set([37, 38, 39, 40, 13]);

      if (
        !keyset.has(e.keyCode || e.charCode) &&
        e.target.value.length > 0) gazetteer.search(e.target.value);

    });

    // Keydown events
    gazetteer.input.addEventListener('keydown', e => {

      const key = e.keyCode || e.charCode;

      // Cancel search and set results to empty on backspace or delete keydown
      if (key === 46 || key === 8) {
        if (gazetteer.xhr) gazetteer.xhr.abort();
        gazetteer.clear();
        if (gazetteer.layer) _xyz.map.removeLayer(gazetteer.layer);
        return;
      }

      // Select first result on enter keypress
      if (key === 13) {

        // Get possible coordinates from input and draw location if valid
        let latlng = e.target.value.split(',').map(parseFloat);
        if ((latlng[1] > -90 && latlng[1] < 90) && (latlng[0] > -180 && latlng[0] < 180)) {
          if (gazetteer.xhr) gazetteer.xhr.abort();
          gazetteer.clear();
          gazetteer.createFeature({
            type: 'Point',
            coordinates: [latlng[1], latlng[0]]
          });
        }

        gazetteer.result.querySelector('li').click();
      }
    });

    // Cancel search and empty results on input focusout
    gazetteer.input.addEventListener('focusout', () => {
      if (gazetteer.xhr) gazetteer.xhr.abort();
      setTimeout(gazetteer.clear, 400);
    });

    gazetteer.clear = () => {
      gazetteer.group.classList.remove('active');
      gazetteer.result.innerHTML = '';
    }

  };

  function search (term, params = {}){
 
    // Empty results.
    gazetteer.clear && gazetteer.clear();
  
    // Abort existing xhr and create new.
    gazetteer.xhr && gazetteer.xhr.abort();
    gazetteer.xhr = new XMLHttpRequest();
  
    // Send gazetteer query to backend.
    gazetteer.xhr.open('GET', _xyz.host + '/api/gazetteer?' +
      _xyz.utils.paramString({
        locale: _xyz.locale.key,
        q: encodeURIComponent(term),
        source: params.source
      }));
  
    gazetteer.xhr.setRequestHeader('Content-Type', 'application/json');
    gazetteer.xhr.responseType = 'json';
    gazetteer.xhr.onload = e => {
  
      if (e.target.status !== 200) return;
        
      if (params.callback) return params.callback(e.target.response);
  
      // No results
      if (e.target.response.length === 0) {
        gazetteer.result.appendChild(_xyz.utils.html.node`
        <li>${_xyz.language.search_no_results}`);
        return gazetteer.group.classList.add('active');
      }
  
      // Add results from JSON to gazetteer.
      Object.values(e.target.response).forEach(entry => {
  
        gazetteer.result.appendChild(_xyz.utils.html.node`
        <li style="cursor:pointer;" onclick=${e=>{
          e.preventDefault();
  
          if (!entry.source || !entry.id) {

            if (gazetteer.callback) return gazetteer.callback(entry);

            entry.marker && gazetteer.createFeature({
              type: 'Point',
              coordinates: entry.marker.split(',')
            });

            return
          }
  
          gazetteer.select({
            label: entry.label,
            id: entry.id,
            source: entry.source,
            layer: entry.layer,
            table: entry.table,
            marker: entry.marker,
            callback: params.callback
          });
  
        }}>
        ${_xyz.locale.gazetteer.label ? _xyz.utils.html.node`
          <span class="secondary-colour-bg" 
          style="font-size: smaller; padding: 0 2px 0 2px; cursor: help; border-radius: 2px;"
          >${(_xyz.layers.list[entry.layer] && _xyz.layers.list[entry.layer].name) || entry.layer || entry.source}</span>` : ``}
          <span>${entry.label}</span>
        `);

        gazetteer.group.classList.add('active');

        });
  
    };
  
    gazetteer.xhr.send();
  };

  function createFeature(geom){
 
    // Parse json if geom is string
    geom = typeof (geom) === 'string' ? JSON.parse(geom) : geom;
  
    // Remove existing layer.
    if (gazetteer.layer) _xyz.map.removeLayer(gazetteer.layer);
    
    gazetteer.layer = _xyz.mapview.geoJSON({
      geometry: geom,
      dataProjection: '4326',
      style: new ol.style.Style({
        image: _xyz.mapview.icon(gazetteer.icon)
      })
    });
  
    _xyz.mapview.flyToBounds(gazetteer.layer.getSource().getExtent());
  
  };

  function select(record){
 
    gazetteer.clear && gazetteer.clear();
  
    if (gazetteer.input) gazetteer.input.value = record.label;
   
    gazetteer.sources[record.source](record);
  };

  function glx(record) {

    if (gazetteer.callback) return gazetteer.callback(record);
  
    _xyz.locations.select({
      locale: _xyz.locale.key,
      layer: _xyz.layers.list[record.layer],
      table: record.table,
      id: record.id,
      _flyTo: true,
    });

    record.callback && record.callback();
  }
  
  function mapbox(record) {

    gazetteer.createFeature({
      type: 'Point',
      coordinates: record.marker
    });

    record.callback && record.callback();
  }

  function google(record) {

    _xyz
      .proxy(`https://maps.googleapis.com/maps/api/place/details/json&placeid=${record.id}&key=GOOGLE`)
      .then(response => {
        const feature = {
          type: 'Point',
          coordinates: [response.result.geometry.location.lng, response.result.geometry.location.lat]
        }
        
        gazetteer.createFeature(feature);
  
        if (gazetteer.callback) return gazetteer.callback(feature);
      
        record.callback && record.callback(feature);
      })

  }

  function opencage(record){

    gazetteer.createFeature({
      type: 'Point',
      coordinates: record.marker
    });

    record.callback && record.callback();

  }

};