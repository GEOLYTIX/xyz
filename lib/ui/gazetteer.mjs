export default params => {

  const gazetteer = Object.assign({

    search: search,

    input: params.target.querySelector('input'),

    result: params.target.querySelector('ul'),

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
      colorMarker: '#003D57',
      colorDot: '#939faa',
      anchor: [0.5, 1],
      scale: 3,
    }
  }, params);

  gazetteer.input.placeholder = gazetteer.placeholder || '';

  // Initiate search on keyup with input value
  gazetteer.input.addEventListener('keyup', e => {

    const keyset = new Set([37, 38, 39, 40, 13])

    !keyset.has(e.keyCode || e.charCode)
      && e.target.value.length > 0
      && gazetteer.search(e.target.value)

  })

  // Keydown events
  gazetteer.input.addEventListener('keydown', e => {

    const key = e.keyCode || e.charCode

    // Cancel search and set results to empty on backspace or delete keydown
    if (key === 46 || key === 8) {
      gazetteer.xhr && gazetteer.xhr.abort()
      gazetteer.clear()
      gazetteer.layer && gazetteer.mapview.Map.removeLayer(gazetteer.layer)
      return
    }

    // Select first result on enter keypress
    if (key === 13) {

      // Get possible coordinates from input and draw location if valid
      let latlng = e.target.value.split(',').map(parseFloat)
      if ((latlng[1] > -90 && latlng[1] < 90) && (latlng[0] > -180 && latlng[0] < 180)) {
        gazetteer.xhr && gazetteer.xhr.abort()
        gazetteer.clear()
        gazetteer.createFeature({
          type: 'Point',
          coordinates: [latlng[1], latlng[0]]
        })
      }

      gazetteer.result.querySelector('li').click()
    }
  })

  // Cancel search and empty results on input focusout
  gazetteer.input.addEventListener('focusout', () => {
    gazetteer.xhr && gazetteer.xhr.abort()
    setTimeout(gazetteer.clear, 400)
  })

  gazetteer.clear = () => {
    //gazetteer.target.classList.remove('active')
    //gazetteer.result.innerHTML = ''
  }

  function search (term, params = {}){
 
    // Empty results.
    gazetteer.clear && gazetteer.clear()
  
    // Abort existing xhr and create new.
    gazetteer.xhr && gazetteer.xhr.abort()
    gazetteer.xhr = new XMLHttpRequest()
  
    // Send gazetteer query to backend.
    gazetteer.xhr.open('GET', gazetteer.mapview.host + '/api/gazetteer?' +
      mapp.utils.paramString({
        locale: gazetteer.mapview.locale.key,
        q: encodeURIComponent(term),
        source: params.source
      }))
  
    gazetteer.xhr.setRequestHeader('Content-Type', 'application/json')
    gazetteer.xhr.responseType = 'json'
    gazetteer.xhr.onload = e => {
  
      if (e.target.status !== 200) return;
        
      if (gazetteer.callback) return gazetteer.callback(e.target.response)
  
      // No results
      if (e.target.response.length === 0) {
        gazetteer.result.appendChild(mapp.utils.html.node`
          <li>${mapp.dictionary.no_results}`)
        
          return gazetteer.target.classList.add('active')
      }
  
      // Add results from JSON to gazetteer.
      Object.values(e.target.response).forEach(entry => {
  
        gazetteer.result.appendChild(mapp.utils.html.node`
          <li
            onclick=${e=>{

              if (!entry.source || !entry.id) {

                if (gazetteer.callback) return gazetteer.callback(entry)

                entry.marker && gazetteer.createFeature({
                  type: 'Point',
                  coordinates: entry.marker.split(',')
                })

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
              })
      
        }}>
        ${gazetteer.label ? mapp.utils.html.node`
          <span class="primary-background"
            style="padding: 0 2px 0 2px; cursor: help; border-radius: 2px; font-size:0.8em;">
              ${(gazetteer.mapview.layers[entry.layer] && gazetteer.mapview.layers[entry.layer].name) || entry.layer || entry.source}</span>` : ``}
              <span>${entry.label}</span>`)

        gazetteer.target.classList.add('active')

        })
  
    }
  
    gazetteer.xhr.send()
  }

  function createFeature(geom){
 
    // Parse json if geom is string
    geom = typeof geom === 'string' && JSON.parse(geom) || geom;
  
    // Remove existing layer.
    gazetteer.layer && gazetteer.mapview.Map.removeLayer(gazetteer.layer)
    
    gazetteer.layer = gazetteer.mapview.geoJSON({
      geometry: geom,
      dataProjection: '4326',
      Style: mapp.utils.style({
        icon: gazetteer.icon
      })
    })

    const view = gazetteer.mapview.Map.getView()

    view.animate({
      zoom: gazetteer.zoom || view.getMaxZoom()
    }, {
      center: ol.proj.fromLonLat(geom.coordinates)
    })
  }

  function select(record){
 
    gazetteer.clear && gazetteer.clear()
  
    if (gazetteer.input) gazetteer.input.value = record.label
   
    gazetteer.sources[record.source](record)
  }

  function glx(record) {

    if (typeof gazetteer.callback === 'function') {
      return gazetteer.callback(record)
    }
  
    mapp.location.get({
      layer: gazetteer.mapview.layers[record.layer],
      table: record.table,
      id: record.id
    }).then(loc => loc.flyTo())
  }
  
  function mapbox(record) {

    gazetteer.createFeature({
      type: 'Point',
      coordinates: record.marker
    })

    record.callback && record.callback()
  }

  function google(record) {

    mapp
      .utils
        .xhr(`${gazetteer.mapview.host}/api/proxy?url=${encodeURIComponent(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${record.id}&{GOOGLE}`)}`)
          .then(response => {
            const feature = {
              type: 'Point',
              coordinates: [response.result.geometry.location.lng, response.result.geometry.location.lat]
            }
            
            gazetteer.createFeature(feature)
      
            if (gazetteer.callback) return gazetteer.callback(feature)
          
            record.callback && record.callback(feature)
          })

  }

  function opencage(record){

    gazetteer.createFeature({
      type: 'Point',
      coordinates: record.marker
    })

    record.callback && record.callback()
  }
}