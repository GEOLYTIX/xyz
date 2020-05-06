const { readFileSync } = require('fs');

const { join } = require('path');

const renderTemplate = location => {
  const template = readFileSync(join(__dirname, location)).toString('utf8')

  return {
    template: template,
    render: params => template.replace(/\$\{(.*?)\}/g, matched => params[matched.replace(/\$|\{|\}/g, '')] || '')
  }
}

const _defaults = {
  workspace: {
    title: 'GEOLYTIX | XYZ',
    locales: {
      zero: {},
    },
  },
  templates: {
    //views
    _desktop: renderTemplate('../../public/views/_desktop.html'),
    _mobile: renderTemplate('../../public/views/_mobile.html'),
    admin_user: renderTemplate('../../public/views/_admin_user.html'),
    admin_workspace: renderTemplate('../../public/views/_admin_workspace.html'),

    //queries
    mvt_cache: require('../../public/queries/mvt_cache'),
    get_nnearest: require('../../public/queries/get_nnearest'),
    field_stats: require('../../public/queries/field_stats'),
    infotip: require('../../public/queries/infotip'),
    count_locations: require('../../public/queries/count_locations'),
    labels: require('../../public/queries/labels'),
    layer_extent: require('../../public/queries/layer_extent'),
    set_field_array: require('../../public/queries/set_field_array'),
    filter_aggregate: require('../../public/queries/filter_aggregate'),
  },
  locale: {
    minZoom: 0,
    maxZoom: 20,
    bounds: {
      north: 90,
      east: 180,
      south: -90,
      west: -180
    },
    view: {},
    layers: {
      OSM: {
        key: 'OSM',
        display: true,
        format: 'tiles',
        URI: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      }
    },
  },
  layers: {
    tiles: {},
    geojson: {
      srid: '4326',
      style: {
        default: {
          strokeWidth: 1,
          strokeColor: '#333333',
          fillColor: '#333333',
          fillOpacity: 0.1,
        },
        highlight: {
          strokeColor: '#1F964D',
          strokeWidth: 2,
          fillColor: '#cae0b8',
          fillOpacity: 0.2,
        },
        themes: {},
      },
      filter: {},
    },
    mvt: {
      srid: '3857',
      style: {
        default: {
          strokeColor: '#333333',
          fillColor: '#333333',
          fillOpacity: 0.1,
        },
        highlight: {
          strokeWidth: 2,
          strokeColor: '#1F964D',
          fillColor: '#cae0b8',
          fillOpacity: 0.2,
        },
        themes: {},
      },
      filter: {},
    },
    cluster: {
      srid: '4326',
      style: {
        markerMin: 20,
        markerMax: 40,
        anchor: null,
        marker: {
          type: 'target',
          fillColor: '#999999',
          scale: 0.05,
        },
        markerMulti: {
          type: 'target',
          fillolor: '#333333',
          scale: 0.05,
        },
        highlight: {
          scale: 0.08
        },
        themes: {},
      },
      filter: {},
    },
    grid: {
      srid: '4326',
      style: {
        range: [
          '#15773f',
          '#66bd63',
          '#a6d96a',
          '#d9ef8b',
          '#fdae61',
          '#f46d43',
          '#d73027',
        ],
      },
    },
  },
}

module.exports = async workspace => {
  
  workspace = Object.assign({}, _defaults.workspace, workspace);

  workspace.templates = Object.assign(_defaults.templates, workspace.templates || {})
  
  await processLocales(workspace.locales);

  return workspace;
}

async function processLocales(locales) {   
  
  for (const key of Object.keys(locales)) {

    locales[key].key = key;
   
    // Remove locale which is not an object.
    if (typeof locales[key] !== 'object') {
      delete locales[key];
      continue;
    }

    locales[key] = Object.assign({}, _defaults.locale, locales[key]);

    locales[key].bounds = Object.assign({}, _defaults.locale.bounds, locales[key].bounds);
    
    await processLayers(locales[key]);
  }
}

async function processLayers(locale) {

  for (const key of Object.keys(locale.layers)) {

    const format = locale.layers[key].format;

    // Check layer format.
    if (typeof locale.layers[key] !== 'object'
        || !format
        || !_defaults.layers[format]) {

      delete locale.layers[key];
      continue;
    }

    locale.layers[key] = Object.assign({}, _defaults.layers[format], locale.layers[key]);

    locale.layers[key].key = key;
    locale.layers[key].name = locale.layers[key].name || key;
    locale.layers[key].locale = locale.key;

    // Check whether layer.style keys are valid or missing.
    if (locale.layers[key].style) locale.layers[key].style = Object.assign({}, _defaults.layers[format].style, locale.layers[key].style);

  }
}