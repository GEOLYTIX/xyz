export default _xyz => (params = {}) => {

  const locale = Object.assign(_xyz.locale, params)
   
  if (!locale.target) return console.log('No target for mapview!')

  _xyz.mapview.node = locale.target

  _xyz.mapview.srid = locale.srid || '3857'

  const z = _xyz.hooks && _xyz.hooks.current.z || locale.view && locale.view.z || locale.minZoom || 0

  const center = ol.proj.fromLonLat([
    parseFloat(_xyz.hooks && _xyz.hooks.current.lng || locale.view && locale.view.lng || 0),
    parseFloat(_xyz.hooks && _xyz.hooks.current.lat || locale.view && locale.view.lat || 0),
  ])

  const extent = locale.bounds && ol.proj.transformExtent(
    [
      parseFloat(locale.bounds.west || -180),
      parseFloat(locale.bounds.south || -90),
      parseFloat(locale.bounds.east || 180),
      parseFloat(locale.bounds.north || 90),
    ],
    'EPSG:4326',
    'EPSG:' + _xyz.mapview.srid)

  _xyz.map = new ol.Map({
    target: _xyz.mapview.node,
    interactions: ol.interaction.defaults({ 
      mouseWheelZoom: locale.scrollWheelZoom || false 
    }),
    controls: [],
    view: new ol.View({ 
      projection: 'EPSG:'+_xyz.mapview.srid,
      zoom: z,
      minZoom: locale.minZoom,
      maxZoom: locale.maxZoom,
      center: center,
      extent: extent
    })
  })

  // Set current mouse position/
  _xyz.map.on('pointermove', e => {
    _xyz.mapview.position = e.coordinate
  })

  // Set interaction break when map move starts.
  _xyz.map.on('movestart', () => _xyz.mapview.interaction.break = true)

  _xyz.mapview.node.addEventListener('changeEnd', () => {

    Object.values(_xyz.layers.list).forEach(layer => {

      // Updated layer data for layers which are shown on map.
      layer.display && layer._dataviews.forEach(dataview => dataview.update())

      // Check whether layer views should be disabled.
      if (layer.view && layer.tables) {
        layer.tableCurrent() === null ? layer.view.classList.add('disabled') : layer.view.classList.remove('disabled');
      }
    })

    if (_xyz.hooks) {

      // Set viewport hooks
      const center = ol.proj.transform(
        _xyz.map.getView().getCenter(),
        'EPSG:' + _xyz.mapview.srid,
        'EPSG:4326')

      _xyz.hooks.set({
        lat: center[1],
        lng: center[0],
        z: _xyz.map.getView().getZoom()
      })
    }

    setTimeout(()=>delete _xyz.mapview.interaction.break, 500)
  })
   
  _xyz.mapview.interaction.highlight.begin()

  // Add zoomControl.
  locale.zoomControl && _xyz.map.addControl(new ol.control.Zoom())

  // Create attribution in map DOM.
  locale.attribution && _xyz.mapview.attribution.create(locale.attribution)

  // Add scalebar.
  locale.showScaleBar && _xyz.map.addControl(new ol.control.ScaleLine({
    target: 'ol-scale'
  }))


  if(locale.maskBounds) {

    const world = [[180, 90], [180, -90], [-180, -90], [-180, 90], [180, 90]]

    const bounds = [
      [locale.bounds.east, locale.bounds.north],
      [locale.bounds.east, locale.bounds.south],
      [locale.bounds.west, locale.bounds.south],
      [locale.bounds.west, locale.bounds.north],
      [locale.bounds.east, locale.bounds.north],
    ]

    const maskFeature = new ol.Feature({
      geometry: new ol.geom
        .Polygon([world, bounds])
        .transform('EPSG:4326', 'EPSG:'+_xyz.mapview.srid)
    })
  
    const maskLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [maskFeature]
      }),
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: _xyz.utils.Chroma('#000').alpha(0.2).rgba()
        })
      }),
      zIndex: 999
    })


    _xyz.map.addLayer(maskLayer)
  }

  _xyz.map.on('moveend', viewChangeEndTimer)
  
  // Use timeout to prevent the viewChangeEvent to be executed multiple times.
  let timer;
  function viewChangeEndTimer() {
    clearTimeout(timer)

    timer = setTimeout(()=>{
      _xyz.mapview.node.dispatchEvent(_xyz.mapview.changeEndEvent)
    }, 500)
  }
  
  // Set layer visibility dependent on inclusion in current hooks
  if (_xyz.hooks && _xyz.hooks.current.layers.length) {
    Object.values(_xyz.layers.list).forEach(layer => {
      layer.display = !!~_xyz.hooks.current.layers.indexOf(layer.key)
    })
  }

  // Show visible layers.
  Object.values(_xyz.layers.list).forEach(layer => layer.display && layer.show())

}