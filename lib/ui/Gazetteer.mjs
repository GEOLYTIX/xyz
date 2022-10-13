export default params => {

  // Assign params to gazetteer object.
  const gazetteer = Object.assign({

    input: params.target.querySelector('input'),

    result: params.target.querySelector('ul'),

    getLocation,

    sources: {
      glx: glx,
      mapbox: mapbox,
      google: google
    }

  }, params);

  gazetteer.input.placeholder = gazetteer.placeholder || '';

  gazetteer.input.oninput = e => {

    // Abort current query.
    gazetteer.xhr && gazetteer.xhr.abort()

    // Clear results
    gazetteer.result.innerHTML = ''

    // Only search if value has length.
    e.target.value.length > 0 && search(e.target.value)
  }

  // Select first result on enter keypress
  gazetteer.input.addEventListener('keydown', e => {
    (e.keyCode || e.charCode) === 13
      && gazetteer.result.querySelector('li').click()
  })

  function search(term){
 
    // Get possible coordinates from input.
    let ll = term.split(',').map(parseFloat)

    // Check whether coordinates are float values.
    if (ll.length === 2 && ll.every(n => !isNaN(n))) {

      gazetteer.result.appendChild(mapp.utils.html.node`
      <li 
        onclick=${e=>{

          gazetteer.result.innerHTML = ''

          gazetteer.getLocation({
            label: `Latitude:${ll[0]}, Longitude:${ll[1]}`,
            source: 'Coordinates',
            lng: ll[1],
            lat: ll[0]
          })

        }}><span>Latitutde:${ll[0]}, Longitude:${ll[1]}`)

      // Do not search if coordinates are provided.
      return;
    }

    // Abort current xhr and create new.
    gazetteer.xhr = new XMLHttpRequest()
  
    // Send gazetteer query to backend.
    gazetteer.xhr.open('GET', gazetteer.mapview.host + '/api/gazetteer?' +
      mapp.utils.paramString({
        locale: gazetteer.mapview.locale.key,
        layer: gazetteer.layer,
        q: encodeURIComponent(term),
      }))
  
    gazetteer.xhr.setRequestHeader('Content-Type', 'application/json')
    gazetteer.xhr.responseType = 'json'
    gazetteer.xhr.onload = e => {
  
      if (e.target.status !== 200) return;
          
      // No results
      if (e.target.response.length === 0) {
        return gazetteer.result.appendChild(mapp.utils.html.node`
          <li>${mapp.dictionary.no_results}`)
      }
  
      // Add results from JSON to gazetteer.
      Object.values(e.target.response).forEach(entry => {
  
        gazetteer.result.append(mapp.utils.html.node`
          <li
            onclick=${e=>{

              gazetteer.result.innerHTML = ''

              if (gazetteer.callback) return gazetteer.callback(entry)

              gazetteer.sources[entry.source]({
                label: entry.label,
                id: entry.id,
                source: entry.source,
                layer: entry.layer,
                table: entry.table,
                marker: entry.marker,
                callback: params.callback
              })
      
            }}>
            <span class="label">${entry.title || (gazetteer.mapview.layers[entry.layer] && gazetteer.mapview.layers[entry.layer].name) || entry.layer || entry.source}</span>
            <span>${entry.label}</span>`)

      })
  
    }
  
    gazetteer.xhr.send()
  }

  function glx(record) {

    gazetteer.getLocation({
      layer: gazetteer.mapview.layers[record.layer],
      table: record.table,
      id: record.id
    }, loc => mapp.location.get(loc).then(loc => loc && loc.flyTo())) 
  }
  
  function google(record) {

    mapp
      .utils
        .xhr(`${gazetteer.mapview.host}/api/proxy?url=${encodeURIComponent(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${record.id}&{GOOGLE}`)}`)
          .then(response => {

            gazetteer.getLocation({
              label: record.label,
              source: record.source,
              lng: response.result.geometry.location.lng,
              lat: response.result.geometry.location.lat
            })
          })
  }

  function mapbox(record) {

    gazetteer.getLocation({
      label: record.label,
      source: record.source,
      lng: record.marker[0],
      lat: record.marker[1]
    })
  }

  function getLocation(location, callback) {

    if (typeof callback === 'function') {
      callback(location)
      return;
    }

    Object.assign(location, {
      layer: {
        mapview: gazetteer.mapview
      },
      Layers: [],
      hook: location.label
    })

    const infoj = [
      {
        title: location.label,
        value: location.source
      },
      {
        type: 'pin',
        value: [location.lng, location.lat],
        srid: '4326',
        class: 'display-none',
        location
      }
    ]

    mapp.location.decorate(Object.assign(location, { infoj }))

    gazetteer.mapview.locations[location.hook] = location

    location.flyTo()
  }
}