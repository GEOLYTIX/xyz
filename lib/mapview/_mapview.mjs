/**
### /mapview

@module /mapview
*/

/**
@global
@typedef {Object} mapview
A mapview object has an Openlayers Map element limited to the locale configuration.
@property {string} host The host domain/path for queries.
@property {object} Map Openlayers Map element.
@property {object} locale The locale defintion for the mapview.
*/

import attribution from './attribution.mjs'

import addLayer from './addLayer.mjs'

import fitView from './fitView.mjs'

import getBounds from './getBounds.mjs'

import geometry from './geometry.mjs'

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

/**
@function decorate

@description
The mapview decorator method decorates the mapview object param as a typedef mapview object.

The mapview decorator may return the async mapviewPromise method which must be awaited if svgTemplates must be loaded or syncPlugins must be executed.

@param {object} mapview JSON params for a new mapview.
@property {string} [mapview.host=mapp.host] The host domain/path for queries.
@property {object} mapview.locale The locale defintion for the mapview.
@property {array} [mapview.svgTemplates] SVG templates to load as mapp.utils.svgSymbols.templates
@property {array} [mapview.syncPlugins] locale.plugins[] must be loaded prior to the execution of syncPlugins.

@returns {mapview} Decorated Mapview.
*/
export default function decorate(mapview) {

  // Assign host from mapp if not implicit.
  mapview.host ??= mapp.host

  Object.assign(mapview, {
    srid: mapview.locale.srid || '3857',
    addLayer,
    fitView,
    geometry,
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

  mapview.view ??= mapview.locale.view

  // Get the initialZoom for the mapview.
  const initialZoom = mapp.hooks?.current?.z
    || mapview.view?.z
    || mapview.locale.minZoom
    || 0

  // Get the initialCenter for the mapview.
  const initialCenter = ol.proj.fromLonLat([
    parseFloat(mapp.hooks?.current?.lng
      || mapview.view?.lng
      || 0),
    parseFloat(mapp.hooks?.current?.lat
      || mapview.view?.lat
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
    mapview.extent = ol.proj.transformExtent([-180, -90, 180, 90], 'EPSG:4326', `EPSG:${mapview.srid}`);
  }

  // Assign ol controls for mapview from locale.
  mapview.controls ??= mapview.locale.mapviewControls
    ?.filter(control => Object.hasOwn(ol.control, control))
    .map(control => new ol.control[control]) || []

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
    controls: mapview.controls, //[new ol.control.Zoom()]
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
  let resizeObserverTimeout;
  new ResizeObserver(() => {

    resizeObserverTimeout && clearTimeout(resizeObserverTimeout)

    resizeObserverTimeout = setTimeout(() => {

      mapview.Map.getTargetElement().dispatchEvent(new Event('resize'))
    }, 400)

  }).observe(mapview.Map.getTargetElement())

  // WARN!
  mapview.locale.maskBounds
    && console.warn('locale.maskBounds is set as mask:true in locale.extent')

  // Extent mask
  if (mapview.locale.extent?.mask) {

    // Set world extent
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
      style: {
        'fill-color': '#0004'
      },
      zIndex: Infinity
    }))
  }

  // Check on old configuration of showScaleBar, scalebar and set to ScaleLine, and warn.
  if (mapview.locale.showScaleBar) {
    console.warn('locale.showScaleBar is deprecated. Use locale.ScaleLine.metric or locale.ScaleLine.imperial instead.')
    // showScaleBar is set to true - so use metric default.
    mapview.locale.ScaleLine = 'metric'
  }

  // scalebar 
  if (mapview.locale.scalebar) {
    console.warn('locale.scalebar is deprecated. Use locale.ScaleLine.metric or locale.ScaleLine.imperial instead.')
    mapview.locale.ScaleLine = mapview.locale.scalebar
  }

  // ScaleLine
  mapview.locale.ScaleLine && mapview.Map.addControl(new ol.control.ScaleLine({
    units: mapview.locale.ScaleLine === 'imperial' ? 'imperial' : 'metric',
  }))

  // Create mapview attribution.
  attribution(mapview)

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

  // Check whether svgSymbols.templates have been loaded.
  if (!mapp.utils.svgSymbols.templates) {
    
    mapview.svgTemplates = mapview.locale.svg_templates
  }

  if (mapview.loadPlugins) {

    mapview.syncPlugins ??= mapview.locale.syncPlugins
  }

  if (mapview.syncPlugins?.length || mapview.svgTemplates) {

    return mapviewPromise(mapview)
  }

  return mapview
}

/**
@function mapviewPromise
@async

@description
mapviewPromise is an async method which resolves to the mapview object. The method is returned from the mapview decorator if the creation of the mapview must be awaited in order to import and execute synchronous plugin methods or load svg_templates required for synchronous feature style render methods.

@param {object} mapview 
@property {array} [mapview.svgTemplates] Array of svg_templates [objects] to be loaded.
@property {array} [mapview.syncPlugins] Array of plugins [key] to be executed in sync.
@property {locale} mapview.locale The locale defintion for the mapview.
@property {array} locale.plugins Array of plugins to dynamically import.

@returns {Promise<mapview>} The async method resolves to the decorated mapview object.
*/
async function mapviewPromise(mapview) {

  await mapp.utils.svgTemplates(mapview.svgTemplates)

  await mapp.utils.loadPlugins(mapview.locale.plugins);

  const syncPlugins = new Set(mapview.syncPlugins)

  // Execute synchronous plugins in order of array.
  for (const key of mapview.syncPlugins) {

    if (typeof mapp.plugins[key] !== 'function') continue;

    await mapp.plugins[key](mapview.locale[key], mapview)
  }

  // Execute all other plugin methods async.
  const asyncPlugins = Object.keys(mapview.locale)
    .filter(key => !syncPlugins.has(key))
    .filter((key) => typeof mapp.plugins[key] === 'function')
    .map((key) => mapp.plugins[key](mapview.locale[key], mapview));

  await Promise.all(asyncPlugins)

  return mapview
}
