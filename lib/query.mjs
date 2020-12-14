export default _xyz => params => new Promise((resolve, reject) => {

  const xhr = new XMLHttpRequest();

  const bounds = params.viewport && _xyz.map && _xyz.mapview.getBounds();

  const center = params.center && _xyz.map && ol.proj.transform(
    _xyz.map.getView().getCenter(),
    `EPSG:${_xyz.mapview.srid}`,
    `EPSG:4326`)

  xhr.open('GET', _xyz.host + '/api/query?' +
    _xyz.utils.paramString(
      Object.assign({

      // Queries will fail if the template can not be accessed in workspace.
      template: encodeURIComponent(params.query),

      // Only required if the template does not have a dbs defined.
      dbs: params.dbs,

      // Layer param must be a key. Taken from a layer object if not explicitly set.
      layer: typeof params.layer === 'string' && params.layer
        || params.layer && params.layer.key,

      // Layer filter can only be applied if the layer is provided as reference to a layer object in the layers list.
      filter: params.filter
        || params.layer && params.layer.filter && params.layer.filter.current,

      // Locale param is only required for layer lookups.
      locale: params.layer && _xyz.locale.key,

      // ID will be taken if a location object is provided with the params.
      id: params.location && params.location.id,

      // lat lng must be explicit or the the center flag param must be set.
      lat: params.lat || center && center[1],
      lng: params.lng || center && center[0],

      // z will generated if the z flag is set in the params.
      z: params.z && _xyz.map && _xyz.map.getView().getZoom(),

      // Viewport will onlcy be generated if the viewport flag is set on the params.
      viewport: bounds && [bounds.west, bounds.south, bounds.east, bounds.north, _xyz.mapview.srid]

    },
    
    // queryparams will be assigned to the paramstring with explicit values.
    params.queryparams || {})))

  xhr.setRequestHeader('Content-Type', 'application/json')

  xhr.responseType = 'json'

  xhr.onload = e => {

    if (e.target.status >= 300) return reject({ err: e.target.status })

    resolve(e.target.response)

  }

  xhr.send()

})