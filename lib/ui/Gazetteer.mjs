export default gazetteer => {

  gazetteer.input = mapp.utils.html.node`<input 
    type="search" 
    placeholder=${gazetteer.placeholder}>`

  gazetteer.list = mapp.utils.html.node`<ul>`

  gazetteer.node = mapp.utils.html.node`<div class="dropdown">
    ${gazetteer.input}
    ${gazetteer.list}`

  gazetteer.target.append(gazetteer.node)

  gazetteer.input.addEventListener('input', e => {

    // Abort current query.
    gazetteer.xhr && gazetteer.xhr.abort()

    // Clear results
    gazetteer.list.innerHTML = ''

    // Only search if value has length.
    if (!e.target.value.length) return;

    // Get possible coordinates from input.
    let ll = e.target.value.split(',').map(parseFloat)

    // Check whether coordinates are float values.
    if (ll.length === 2 && ll.every(n => !isNaN(n))) {

      gazetteer.list.appendChild(mapp.utils.html.node`
          <li 
            onclick=${e => {

          mapp.utils.gazetteer.getLocation({
            label: `Latitude:${ll[0]}, Longitude:${ll[1]}`,
            source: 'Coordinates',
            lng: ll[1],
            lat: ll[0]
          })

        }}><span>Latitutde:${ll[0]}, Longitude:${ll[1]}`)

      // Do not search if coordinates are provided.
      return;
    }

    // Validate whether gazetteer service is available.
    if (!Object.hasOwn(mapp.utils.gazetteer, gazetteer.provider)) {

      return console.warn('Requested gazetteer service not available');
    }

    mapp.utils.gazetteer[gazetteer.provider](e.target.value, gazetteer)

  })

  function search(term){
 
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

      console.log(e.target.response)

      return;
  
      if (e.target.status !== 200) return;
          
      // No results
      if (e.target.response.length === 0) {
        return gazetteer.list.appendChild(mapp.utils.html.node`
          <li>${mapp.dictionary.no_results}`)
      }
  
      // Add results from JSON to gazetteer.
      Object.values(e.target.response).forEach(entry => {
  
        gazetteer.list.append(mapp.utils.html.node`
          <li
            onclick=${e=>{

              gazetteer.list.innerHTML = ''

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
  
}