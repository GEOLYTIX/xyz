export default gazetteer => {

  mapp.utils.merge(mapp.dictionaries, {
    en: {
      invalid_lat_long_range: 'Invalid coordinates: Latitude and longitude values must be within valid ranges.',
      invalid_lat_lon: 'The provided Coordinates do not fall within the selected Locale.'
    },
    de: {
      invalid_lat_long_range: 'Falsche Eingabe von Latitude / Longitude.',
      invalid_lat_lon: 'Koordinate liegt außerhalb der Lokale.'
    }
  })

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

    // Check whether coordinates are valid float values.
    if (ll.length === 2 && ll.every(n => typeof n === 'number' && !isNaN(n) && isFinite(n))) {

      // Check if both coordinates are within valid range (latitude: -90 to 90, longitude: -180 to 180).
      const [lat, lng] = ll;

      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        gazetteer.list.appendChild(mapp.utils.html.node`
        <li onclick=${e => {
            mapp.utils.gazetteer.getLocation({
              label: `Latitude:${ll[0]}, Longitude:${ll[1]}`,
              source: 'Coordinates',
              lng: ll[1],
              lat: ll[0]
            }, gazetteer);
          }}><span>Latitude:${ll[0]}, Longitude:${ll[1]}</span>`);

        // Do not search if coordinates are provided.
        return;

      } else {

        // Handle the case where coordinates are not within valid ranges.
        // Add the error as a list item
        gazetteer.list.appendChild(mapp.utils.html.node`
          <li style="color: red;">
            <span>${mapp.dictionary.invalid_lat_long_range}</span>`);
        
      }
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