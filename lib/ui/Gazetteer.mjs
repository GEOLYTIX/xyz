export default gazetteer => {

  gazetteer.input = mapp.utils.html.node`<input 
    type="search" 
    placeholder=${gazetteer.placeholder}>`

  gazetteer.list = mapp.utils.html.node`<ul>`

  gazetteer.node = mapp.utils.html.node`<div class="dropdown">
    ${gazetteer.input}
    ${gazetteer.list}`

  gazetteer.target.append(gazetteer.node)

  gazetteer.input.addEventListener('input', search)

  gazetteer.input.addEventListener('focus', search)

  function search(e) {

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
          }, gazetteer)

        }}><span>Latitude:${ll[0]}, Longitude:${ll[1]}`)

      // Do not search if coordinates are provided.
      return;
    }

    // An external gazetteer provider is requested
    if (gazetteer.provider) {

      // Check whether the gazetteer provider is available.
      if (!Object.hasOwn(mapp.utils.gazetteer, gazetteer.provider)) {

        console.warn('Requested gazetteer service not available');
      } else {

        // Query the external gazetteer provider
        mapp.utils.gazetteer[gazetteer.provider](e.target.value, gazetteer)
      }
    }

    // Request datasets gazetteer
    mapp.utils.gazetteer.datasets(e.target.value, gazetteer)
  }
  
}