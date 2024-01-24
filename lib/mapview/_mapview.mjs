import addLayer from './addLayer.mjs'

import fitView from './fitView.mjs'

import getBounds from './getBounds.mjs'

import geoJSON from './geoJSON.mjs'

import infotip from './infotip.mjs'

import locate from './locate.mjs'

import popup from './popup.mjs'

import allFeatures from './allFeatures.mjs'

import _highlight from './interactions/highlight.mjs'

import _draw from './interactions/draw.mjs'

import _modify from './interactions/modify.mjs'

import _zoom from './interactions/zoom.mjs'

import snap from './interactions/snap.mjs'

export default (mapview) => {

  Object.assign(mapview, {
    srid: mapview.locale.srid || '3857',
    addLayer,
    fitView,
    geoJSON,
    getBounds,
    infotip,
    locate,
    metrics: {
      distance: (geometry) => ol.sphere.getLength(
        new ol.geom.LineString([geometry.getInteriorPoint().getCoordinates(), mapview.position])),
      area: (geometry) => ol.sphere.getArea(geometry),
      length: (geometry) => ol.sphere.getLength(geometry),
    },
    popup,
    allFeatures,
    layers: {},
    locations: {},
    interactions: {
      highlight: _highlight.bind(mapview),
      draw: _draw.bind(mapview),
      modify: _modify.bind(mapview),
      zoom: _zoom.bind(mapview),
      snap
    }
  })

  // Get the initialZoom for the mapview.
  const initialZoom = mapp.hooks?.current?.z
    || mapview.locale.view?.z
    || mapview.locale.minZoom
    || 0

  // Get the initialCenter for the mapview.
  const initialCenter = ol.proj.fromLonLat([
    parseFloat(mapp.hooks?.current?.lng
      || mapview.locale.view?.lng
      || 0),
    parseFloat(mapp.hooks?.current?.lat
      || mapview.locale.view?.lat
      || 0),
  ])

  // WARN!
  mapview.locale.bounds && console.warn('locale.bounds have been renamed to locale.extent')

  const north = parseFloat(mapview.locale.extent?.north || 90);
  const south = parseFloat(mapview.locale.extent?.south || -90);
  const east = parseFloat(mapview.locale.extent?.east || 180);
  const west = parseFloat(mapview.locale.extent?.west || -180);

  if ((north - south) >= 0 && (east - west) >= 0) {
    mapview.extent = ol.proj.transformExtent([west, south, east, north], 'EPSG:4326', `EPSG:${mapview.srid}`);
  } else {
    console.warn('Invalid extent. Ensure north >= south and east >= west. Global extent is assumed.');
  }

  // Map
  mapview.Map = new ol.Map({
    target: mapview.target,
    interactions: ol.interaction.defaults.defaults({
      mouseWheelZoom: mapview.scrollWheelZoom && {
        duration: 250, // default
        timeout: 80 // default
      } || false,
      pinchRotate: mapview.pinchRotate && {
        threshold: 3
      } || false
    }),
    moveTolerance: 5,
    controls: mapview.controls || [], //[new ol.control.Zoom()]
    view: new ol.View({
      projection: `EPSG:${mapview.srid}`,
      zoom: initialZoom,
      minZoom: mapview.locale.minZoom,
      maxZoom: mapview.locale.maxZoom,
      center: initialCenter,
      extent: mapview.extent
    })
  })

  // Observe whether the mapview.Map target element changes size.
  // Method should debounce to account for manual resizing, ie. with a slider element.
  let resizeObserverTimeout
  new ResizeObserver(() => {

    resizeObserverTimeout && clearTimeout(resizeObserverTimeout)

    resizeObserverTimeout = setTimeout(() => {

      mapview.Map.getTargetElement().dispatchEvent(new Event('resize'))

      // This should happen automatically with later versions of OL.
      // mapview.Map.updateSize()

    }, 400)

  }).observe(mapview.Map.getTargetElement())

  // WARN!
  mapview.locale.maskBounds && console
    .warn('locale.maskBounds is set as mask:true in locale.extent')

  // Extent mask
  if (mapview.locale.extent?.mask) {

    // Set world exte

    const world = [
      [180, 90],
      [180, -90],
      [-180, -90],
      [-180, 90],
      [180, 90],
    ]

    // Set locale extent
    const extent = [
      [mapview.locale.extent.east, mapview.locale.extent.north],
      [mapview.locale.extent.east, mapview.locale.extent.south],
      [mapview.locale.extent.west, mapview.locale.extent.south],
      [mapview.locale.extent.west, mapview.locale.extent.north],
      [mapview.locale.extent.east, mapview.locale.extent.north],
    ]

    // Create a maskFeature from the word and locale extent.
    const maskFeature = new ol.Feature({
      geometry: new ol.geom

        // Use world and locale extent as polygon rings.
        // The second ring will be subtracted.
        .Polygon([world, extent])
        .transform(`EPSG:4326`, `EPSG:${mapview.srid}`)
    })

    // Add masklayer with the maskFeature
    // and infinite zIndex to mapview.Map
    mapview.Map.addLayer(new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [maskFeature]
      }),
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: '#00000044'
        })
      }),
      zIndex: Infinity
    }))
  }

  // ScaleBar
  mapview.locale.ScaleLine && mapview.Map.addControl(new ol.control.ScaleLine({
    units: mapview.locale.ScaleLine === 'imperial' ? 'imperial' : 'metric',
  }))

  // Attribution
  if (mapview.attribution) {

    if (typeof mapview.attribution !== 'object') {
      mapview.attribution = {}
    }

    mapview.attribution.target = mapview.attribution.target
      || mapview.Map.getTargetElement()
        .appendChild(mapp.utils.html.node`
          <div class="attribution-links">`)

    mapview.attribution.check = () => {

      const o = Object.assign({}, mapview.attribution.links || {})

      // Iterate through layers to check whether attribution should be displayed.
      Object.values(mapview.layers).forEach(layer => {
        layer.display && layer.attribution && Object.assign(
          o, layer.attribution)
      })

      // Render the layer attribution links into the placeholder.
      mapp.utils.render(mapview.attribution.target,
        mapp.utils.html`${Object.entries(o)
          .map(entry => mapp.utils.html`
              <a target="_blank" href="${entry[1]}">${entry[0]}`)}`)

    }
  }

  // Events

  // pointermove
  mapview.Map.on('pointermove', e => {

    // The geographic coordinate.
    mapview.position = e.coordinate

    // The pixel coordinate.
    mapview.pointerLocation = {
      x: e.originalEvent.clientX,
      y: e.originalEvent.clientY
    }
  })

  // mouseout
  mapview.Map.getTargetElement().addEventListener('mouseout', () => {

    mapview.infotip(null)

    // Set position on and pointerLocation to null.
    mapview.position = null
    mapview.pointerLocation = {
      x: null,
      y: null
    }
  })

  // changeEnd
  mapview.Map.getTargetElement().addEventListener('changeEnd', changeEnd)

  function changeEnd() {

    // Update URL params if enabled on mapview
    if (!mapview.hooks) return;

    // Get center from Map.View
    const center = ol.proj.transform(
      mapview.Map.getView().getCenter(),
      `EPSG:${mapview.srid}`,
      `EPSG:4326`)

    // Set lat, lng, z URL params.
    mapp.hooks.set({
      lat: Math.round((center[1] + Number.EPSILON) * 100000) / 100000,
      lng: Math.round((center[0] + Number.EPSILON) * 100000) / 100000,
      z: Math.round((mapview.Map.getView().getZoom() + Number.EPSILON) * 100) / 100
    })
  }

  // Timer to debounce changeEnd event.
  let changeEndTimer

  // moveend to call changeEnd event.
  mapview.Map.on('moveend', () => {
    clearTimeout(changeEndTimer)

    changeEndTimer = setTimeout(() => {
      mapview.Map.getTargetElement().dispatchEvent(new CustomEvent('changeEnd'))
    }, 500)
  })

  changeEndTimer = setTimeout(() => {
    mapview.Map.getTargetElement().dispatchEvent(new CustomEvent('changeEnd'))
  }, 500)

  return mapview
}