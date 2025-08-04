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
@property {function} changend The changeend method is triggered by the mapview.Map moveend event.
*/

import addLayer from './addLayer.mjs';
import allFeatures from './allFeatures.mjs';
import attribution from './attribution.mjs';

import fitView from './fitView.mjs';
import geoJSON from './geoJSON.mjs';

import geometry from './geometry.mjs';
import getBounds from './getBounds.mjs';

import infotip from './infotip.mjs';
import _draw from './interactions/draw.mjs';
import _highlight from './interactions/highlight.mjs';
import _modify from './interactions/modify.mjs';
import snap from './interactions/snap.mjs';
import _zoom from './interactions/zoom.mjs';
import locate from './locate.mjs';
import popup from './popup.mjs';
import removeLayer from './removeLayer.mjs';

/**
@function decorate

@description
The mapview decorator method decorates the mapview object param as a typedef mapview object.

The mapview decorator may return the async mapviewPromise method which must be awaited if svgTemplates must be loaded or syncPlugins must be executed.

@param {object} mapview JSON params for a new mapview.
@property {string} [mapview.host=mapp.host] The host domain/path for queries.
@property {object} mapview.locale The locale defintion for the mapview.
@property {Object} [locale.svgTemplates] Object of template key and src values to be loaded as svg strings. locale.svg_templates is the legacy property.
@property {array} [locale.syncPlugins] An array plugins to be loaded in order.

@returns {mapview} Decorated Mapview.
*/
export default function decorate(mapview) {
  if (!mapview.locale) {
    console.warn(`A locale property is required to decorare a mapview object.`);
    return;
  }

  // Replace keyvalue_dictionary entries if required.
  mapp.utils.keyvalue_dictionary(mapview.locale);

  // Assign host from mapp if not implicit.
  mapview.host ??= mapp.host;

  Object.assign(mapview, {
    addLayer,
    allFeatures,
    changeEnd,
    fitView,
    geoJSON,
    geometry,
    getBounds,
    infotip,
    interactions: {
      draw: _draw.bind(mapview),
      highlight: _highlight.bind(mapview),
      modify: _modify.bind(mapview),
      snap,
      zoom: _zoom.bind(mapview),
    },
    layers: {},
    locate,
    locations: {},
    metrics: {
      area: (geometry) => ol.sphere.getArea(geometry),
      distance: (geometry) =>
        ol.sphere.getLength(
          new ol.geom.LineString([
            geometry.getInteriorPoint().getCoordinates(),
            mapview.position,
          ]),
        ),
      length: (geometry) => ol.sphere.getLength(geometry),
    },
    popup,
    removeLayer,
    srid: mapview.locale.srid || '3857',
  });

  viewConfig(mapview);

  mapviewControls(mapview);

  // Map
  mapview.Map = new ol.Map({
    controls: mapview.controls,
    interactions: ol.interaction.defaults.defaults({
      mouseWheelZoom:
        (mapview.scrollWheelZoom && {
          duration: 250, // default
          timeout: 80, // default
        }) ||
        false,
      pinchRotate:
        (mapview.pinchRotate && {
          threshold: 3,
        }) ||
        false,
    }),
    moveTolerance: 5,
    target: mapview.target, //[new ol.control.Zoom()]
    view: new ol.View(mapview.view),
  });

  // Observe whether the mapview.Map target element changes size.
  // Method should debounce to account for manual resizing, ie. with a slider element.
  let resizeObserverTimeout;
  new ResizeObserver(() => {
    resizeObserverTimeout && clearTimeout(resizeObserverTimeout);

    resizeObserverTimeout = setTimeout(() => {
      mapview.Map.getTargetElement().dispatchEvent(new Event('resize'));
    }, 400);
  }).observe(mapview.Map.getTargetElement());

  viewMask(mapview);

  // Create mapview attribution.
  attribution(mapview);

  // Events

  // pointermove
  mapview.Map.on('pointermove', (e) => {
    // The geographic coordinate.
    mapview.position = e.coordinate;

    // The pixel coordinate.
    mapview.pointerLocation = {
      x: e.originalEvent.clientX,
      y: e.originalEvent.clientY,
    };
  });

  // mouseout
  mapview.Map.getTargetElement().addEventListener('mouseout', () => {
    mapview.infotip(null);

    // Set position on and pointerLocation to null.
    mapview.position = null;
    mapview.pointerLocation = {
      x: null,
      y: null,
    };
  });

  mapview.Map.getTargetElement().addEventListener('changeEnd', () =>
    mapview.changeEnd(),
  );

  mapview.Map.on('moveend', () => {
    clearTimeout(mapview.changeEndTimer);

    // Debounce dispatching the changeEnd event.
    mapview.changeEndTimer = setTimeout(() =>
      mapview.Map.getTargetElement().dispatchEvent(
        new CustomEvent('changeEnd'),
        500,
      ),
    );
  });

  // svgTemplates replaces the legacy svg_templates configuration
  mapview.locale.svgTemplates ??= mapview.locale.svg_templates;

  if (mapview.locale.syncPlugins?.length || mapview.locale.svgTemplates) {
    return mapviewPromise(mapview);
  }

  return mapview;
}

/**
@function viewConfig

@description
The method sets the view config for the mapview.

@param {object} mapview JSON params for a new mapview.
@property {object} [mapview.view] The view config.
@property {float} [view.lng = 0] Longitude
@property {float} [view.lat = 0] Latitude
*/
function viewConfig(mapview) {
  mapview.view ??= {};

  mapview.view.projection = `EPSG:${mapview.srid}`;

  mapview.view.minZoom = mapview.locale.minZoom || 0;

  mapview.view.maxZoom = mapview.locale.maxZoom;

  mapview.view.zoom =
    mapp.hooks?.current?.z || mapview.locale?.view?.z || mapview.view.minZoom;

  mapview.view.center = ol.proj.fromLonLat([
    parseFloat(mapp.hooks?.current?.lng || mapview.locale.view?.lng || 0),
    parseFloat(mapp.hooks?.current?.lat || mapview.locale.view?.lat || 0),
  ]);

  viewExtent(mapview);
}

/**
@function viewExtent

@description
The methods checks the locale extent configuration and sets the view extent.

@param {object} mapview JSON params for a new mapview.
@property {locale} mapview.locale The mapview locale.
@property {object} [mapview.view] The view config.
@property {object} [locale.extent] The locale/view extent.
*/
function viewExtent(mapview) {
  if (mapview.locale.bounds) {
    console.warn('locale.bounds have been renamed to locale.extent');
    mapview.locale.extent = mapview.locale.bounds;
  }

  const north = parseFloat(mapview.locale.extent?.north || 90);
  const south = parseFloat(mapview.locale.extent?.south || -90);
  const east = parseFloat(mapview.locale.extent?.east || 180);
  const west = parseFloat(mapview.locale.extent?.west || -180);

  if (north - south >= 0 && east - west >= 0) {
    mapview.view.extent = ol.proj.transformExtent(
      [west, south, east, north],
      'EPSG:4326',
      `EPSG:${mapview.srid}`,
    );
  } else {
    console.warn(
      'Invalid extent. Ensure north >= south and east >= west. Global extent is assumed.',
    );
    mapview.view.extent = ol.proj.transformExtent(
      [-180, -90, 180, 90],
      'EPSG:4326',
      `EPSG:${mapview.srid}`,
    );
  }

  // Assign extent for gazetteer check.
  mapview.extent = mapview.view.extent;
}

/**
@function mapviewControls

@description
The method parses mapview control configs in the locale and creates the mapview.controls array of openlayer map control elements.

An array of mapviewControls, eg. `mapviewControls = ['Zoom']` can be defined to add the control to the mapview.Map on creation.

@param {object} mapview JSON params for the new mapview.Map.
@property {locale} mapview.locale The mapview locale.
@property {array} [locale.mapviewControls] Array of openlayers map controls eg. 'Zoom'.
@property {boolean} [locale.showScaleBar] Legacy config to show metric ScaleLine.
@property {string} [locale.scalebar] Legacy config to define ScaleLine units.
@property {string} [locale.ScaleLine] String configuration for openlayers ScaleLine units ['metric' or 'imperial'].
*/
function mapviewControls(mapview) {
  // Assign ol controls for mapview from locale.
  mapview.controls =
    mapview.locale.mapviewControls
      ?.filter((control) => Object.hasOwn(ol.control, control))
      .map((control) => new ol.control[control]()) || [];

  if (mapview.locale.showScaleBar) {
    // The legacy boolean showScaleBar config will set the ScaleLine to metric.
    mapview.locale.ScaleLine ??= 'metric';
  }

  if (mapview.locale.scalebar) {
    // The legacy scalebar config will set as ScaleLine.
    mapview.locale.ScaleLine ??= mapview.locale.scalebar;
  }

  if (mapview.locale.ScaleLine) {
    // The ScaleLine property must be imperial or metric
    mapview.locale.ScaleLine =
      mapview.locale.ScaleLine === 'imperial' ? 'imperial' : 'metric';

    mapview.controls.push(
      new ol.control.ScaleLine({
        units: mapview.locale.ScaleLine,
      }),
    );
  }
}

/**
@function viewMask

@description
A mask layer will be added to the mapview map if the mask flag is set in the locale.extent.

@param {object} mapview JSON params for a new mapview.
@property {locale} mapview.locale The mapview locale.
@property {object} [locale.extent] The locale/view extent.
@property {boolean} [extent.mask] Apply mask layer to the view extent.
*/
function viewMask(mapview) {
  if (mapview.locale.maskBounds) {
    console.warn('locale.maskBounds is set as mask:true in locale.extent');
  }

  // Extent mask
  if (!mapview.locale.extent?.mask) return;

  // Set world extent
  const world = [
    [180, 90],
    [180, -90],
    [-180, -90],
    [-180, 90],
    [180, 90],
  ];

  // Set locale extent
  const extent = [
    [mapview.locale.extent.east, mapview.locale.extent.north],
    [mapview.locale.extent.east, mapview.locale.extent.south],
    [mapview.locale.extent.west, mapview.locale.extent.south],
    [mapview.locale.extent.west, mapview.locale.extent.north],
    [mapview.locale.extent.east, mapview.locale.extent.north],
  ];

  // Create a maskFeature from the word and locale extent.
  const maskFeature = new ol.Feature({
    geometry: new // Use world and locale extent as polygon rings.
    // The second ring will be subtracted.
    ol.geom.Polygon([world, extent]).transform(
      `EPSG:4326`,
      `EPSG:${mapview.srid}`,
    ),
  });

  // Add masklayer with the maskFeature
  // and infinite zIndex to mapview.Map
  mapview.Map.addLayer(
    new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [maskFeature],
      }),
      style: {
        'fill-color': '#0004',
      },
      zIndex: Infinity,
    }),
  );
}

/**
@function changeEnd

@description
The changeEnd method assigned to the mapview [this] will be triggered by the Openlayers mapview.Map moveend event.

The changeEnd method stores the current view parameters lat, lng, z in the locale view.

The view parameters will also be set as url params with hooks option priovided to the mapview decorator.
*/
function changeEnd() {
  this.view = {};

  // Assign the Map.view z to the mapview object.
  this.view.z =
    Math.round((this.Map.getView().getZoom() + Number.EPSILON) * 100) / 100;

  // Get center from Map.View
  const center = ol.proj.transform(
    this.Map.getView().getCenter(),
    `EPSG:${this.srid}`,
    `EPSG:4326`,
  );

  this.view.lat = Math.round((center[1] + Number.EPSILON) * 100000) / 100000;
  this.view.lng = Math.round((center[0] + Number.EPSILON) * 100000) / 100000;

  this.locale.view = this.view;

  // Update URL params if enabled on mapview
  if (!this.hooks) return;

  // Set lat, lng, z URL params.
  mapp.hooks.set(this.view);
}

/**
@function mapviewPromise
@async

@description
mapviewPromise is an async method which resolves to the mapview object. The method is returned from the mapview decorator if the creation of the mapview must be awaited in order to import and execute synchronous plugin methods or load svg_templates required for synchronous feature style render methods.

@param {object} mapview 
@property {locale} mapview.locale The locale defintion for the mapview.
@property {array} locale.plugins Array of plugins to dynamically import.
@property {array} [locale.syncPlugins] Array of plugins [key] to be executed in sync.
@property {array} [locale.svgTemplates] Array of svg_templates [objects] to be loaded.

@returns {Promise<mapview>} The async method resolves to the decorated mapview object.
*/
async function mapviewPromise(mapview) {
  await mapp.utils.svgTemplates(mapview.locale.svgTemplates);

  // Load dictionary if language other than English.
  if (
    mapp.language !== 'en' &&
    !Object.hasOwn(mapp.dictionaries, mapp.language)
  ) {
    await mapp.utils.loadDictionary(mapp.language);
  }

  if (mapview.loadPlugins) {
    await mapp.utils.loadPlugins(
      mapview.locale.plugins,
      Array.isArray(mapview.loadPlugins) ? mapview.loadPlugins : undefined,
    );
  }

  mapview.locale.syncPlugins ??= [];

  const syncPlugins = new Set(mapview.locale.syncPlugins);

  // Execute synchronous plugins in order of array.
  for (const key of mapview.locale.syncPlugins) {
    if (typeof mapp.plugins[key] !== 'function') continue;

    await mapp.plugins[key](mapview.locale[key], mapview);
  }

  // Execute all other plugin methods async.
  const asyncPlugins = Object.keys(mapview.locale)
    .filter((key) => !syncPlugins.has(key))
    .filter((key) => typeof mapp.plugins[key] === 'function')
    .map((key) => mapp.plugins[key](mapview.locale[key], mapview));

  await Promise.all(asyncPlugins);

  return mapview;
}
