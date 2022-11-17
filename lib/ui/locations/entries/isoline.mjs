const typeMethods = {
  isoline_here,
  isoline_mapbox
}

export default entry => {

  entry.value = typeof entry.value === 'string'
    && JSON.parse(entry.value)
      || entry.value

  // Assign Style if not already assigned.
  entry.Style = entry.Style
  
    // Create OL style object from style object.
    || typeof entry.style === 'object' && mapp.utils.style(entry.style)

    // Assign style from location.
    || entry.location.Style

  const chkbox = mapp.ui.elements.chkbox({
    label: entry.label || 'Isoline',
    checked: !!entry.display,
    onchange: (checked) => {

      // Show geometry of checked.
      if (checked) {
        entry.show()

      } else {
        
        // Remove the geometry layer from map.
        entry.display = false
        entry.L && entry.location.layer.mapview.Map.removeLayer(entry.L)
      }
    }
  })

  entry.show = show

  // entry.show() returns true if location.update() is called.
  if (entry.display && entry.show()) return 'break';

  const icon = entry.style && mapp.utils.html`
    ${mapp.ui.elements.legendIcon(
      Object.assign({ width: 24, height: 24 }, entry.style)
    )}`;

  return mapp.utils.html.node`<div class="flex-spacer">${chkbox}${icon}`
}

function show() {

  this.display = true

  if (this.L) {

    // Remove existing layer to prevent assertion error.
    this.location.layer.mapview.Map.removeLayer(this.L)

    // Add existing geometry layer to mapview
    this.location.layer.mapview.Map.addLayer(this.L)
    return;
  }

  if (this.value) {

    this.L = this.location.layer.mapview.geoJSON({
      zIndex: this.zIndex,
      geometry: this.value,
      Style: this.Style,
      dataProjection: '4326'
    })

    this.location.Layers.push(this.L)
    return;
  }

  const pin = this.location.infoj.find(lookup => lookup.type === 'pin')

  this.params.latlng = ol.proj.transform(pin.value,
    `EPSG:${pin.srid || '3857'}`,
    'EPSG:4326')

  this.location.view?.classList.add('disabled')

  typeMethods[this.type](this)

  return true;
}

function isoline_mapbox(entry) {

  // Assign entry params to defaults
  const params = Object.assign({
    profile: 'driving',
    minutes: 10
  }, entry.params)

  mapp.utils
    .xhr(`https://api.mapbox.com/isochrone/v1/mapbox/`
      +`${params.profile}/${params.latlng[0]},${params.latlng[1]}?`
      +`${mapp.utils.paramString({
        contours_minutes: params.minutes,
        polygons: true,
        access_token: params.access_token
      })}`)
    .then(async response => {

      if (!entry.location.remove) return;

      if (!response.features) return;

      // Assign feature geometry as new value.
      entry.newValue = response.features[0].geometry

      // Update the location in the database.
      // The location view will be updated through callback after the update method.
      entry.location.update()
    })

}

function isoline_here(entry) {

  // Assign entry params to defaults
  const params = Object.assign({
    'range[type]': 'time',
    minutes: 10,
    reverseDirection: false,
    transportMode: 'car',
    optimizeFor: 'balanced'
  }, entry.params)

  if(!params['range[values]']) params['range[values]'] = params.minutes * 60
  delete params.minutes

  params.origin = `${params.latlng[1]},${params.latlng[0]}`
  delete params.latlng

  mapp.utils
    .xhr(`${entry.location.layer.mapview.host}/api/proxy?url=`
      +`${encodeURIComponent(`https://isoline.router.hereapi.com/v8/isolines?`
      +`${mapp.utils.paramString(params)}&{HERE}`)}`)
    .then(response => {

      if (!entry.location.remove) return;

      if (!response.isolines) {
        console.log(response)
        return alert('Failed to process request')
      }

      const _coordinates = mapp.utils.here.decodeIsoline(response.isolines[0].polygons[0].outer)

      _coordinates.polyline.forEach(p => p.reverse())

      _coordinates.polyline.push(_coordinates.polyline[0])

      // Assign feature geometry as new value.
      entry.newValue = {
        type: 'Polygon',
        coordinates: [_coordinates.polyline]
      }

      // Update the location in the database.
      // The location view will be updated through callback after the update method.
      entry.location.update()
    })

}