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

  // Initialise googlePlaces API
  if (gazetteer.key) googlePlaces();

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

    var service = new window.google.maps.places.PlacesService(document.getElementById("Attribution"));

    service.getDetails({
      placeId: record.id,
      fields: ['geometry']
    }, (place, status) => {
      console.log(place)
      gazetteer.getLocation({
        label: record.label,
        source: record.source,
        lng: place.geometry.location.lng(),
        lat: place.geometry.location.lat()
      })
    });

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

    gazetteer.streetview && infoj.push({ 
      type: 'streetview',
      location
    })

    mapp.location.decorate(Object.assign(location, { infoj }))

    gazetteer.mapview.locations[location.hook] = location

    if (gazetteer.zoom) {
      let view = gazetteer.mapview.Map.getView()
      view.setZoom(gazetteer.zoom)
      view.setCenter(ol.proj.fromLonLat([location.lng, location.lat]))
      
    } else {
      location.flyTo()
    }
  }

  function googlePlaces() {

    window.google = window.google || {};

    window.google.maps = window.google.maps || {};

    var
        params = {
            key: gazetteer.key,
            v: "weekly",
            libraries: "places"
        },
        promise,
        libraries = new Set(),
        load = () => promise
            || (promise = new Promise(async (resolve, reject) => {

                let el = document.createElement("script")

                let searchParams = new URLSearchParams()

                searchParams.set("libraries", [...libraries] + "");

                for (var key in params) searchParams.set(
                    key.replace(/[A-Z]/g, (t) => "_" + t[0].toLowerCase()),
                    params[key]
                );

                searchParams.set("callback", "google.maps.__ib__");

                el.src = "https://maps.googleapis.com/maps/api/js?" + searchParams;

                window.google.maps.__ib__ = resolve;
                el.onerror = () => (h = reject(Error("The Google Maps JavaScript API could not load.")));
                el.nonce = document.querySelector("script[nonce]")?.nonce || "";
                document.head.append(el);
            }));

    window.google.maps.importLibrary
        ? console.warn("The Google Maps JavaScript API only loads once.")
        : (window.google.maps.importLibrary = (f, ...n) => libraries.add(f) && load().then(() => window.google.maps.importLibrary(f, ...n)));

    window.google.maps.importLibrary("places");

  }
}