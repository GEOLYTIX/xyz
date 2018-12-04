import map from './xyz_leaflet/index.mjs';

map.init({
  map_id: 'xyz_map',
  host: document.head.dataset.dir,
  view_latlon: [52, 0],
  view_zoom: 7,
  bounds: {
    north: 62,
    east: 5,
    south: 48,
    west: -13
  },
  minZoom: 6,
  maxZoom: 17
});

map.addLayer({
  format: 'tiles',
  key: 'base',
  URI: 'https://api.mapbox.com/styles/v1/dbauszus/ciozrimi3002bdsm8bjtn2v1y/tiles/256/{z}/{x}/{y}?&provider=MAPBOX'
});

map.addLayer({
  format: 'mvt',
  key: 'oa',
  locale: 'GB',
  tables: {
    12: 'dev.oa'
  },
  qID: 'id',
  style: {
    theme: {
      type: 'graduated',
      field: 'pop_11',
      cat: {
        0: {
          label: '0 to 10000',
          fillColor: '#15773f'
        },
        100: {
          label: '10000 to 25000',
          fillColor: '#66bd63'
        },
        200: {
          label: '25000 to 50000',
          fillColor: '#a6d96a'
        },
        300: {
          label: '50000 to 100000',
          fillColor: '#d9ef8b'
        },
        400: {
          label: '100000 to 250000',
          fillColor: '#fdae61'
        },
        500: {
          label: '250000 to 500000',
          fillColor: '#f46d43'
        },
        600: {
          label: '500000 or more',
          fillColor: '#d73027'
        }
      }
    },
    default: {
      weight: 1,
      color: '#333333',
      fill: true,
      fillColor: '#333333',
      fillOpacity: 0.1
    },
    highlight: {
      weight: 2,
      color: '#009900',
      fill: true,
      fillColor: '#ccff99',
      fillOpacity: 0.2
    }
  }
});

map.addLayer({
  format: 'cluster',
  key: 'retail_points',
  locale: 'GB',
  table: 'dev.retailpoints',
  cluster_kmeans: 0.05,
  cluster_dbscan: 0.01,
  style: {
    markerMin: 20,
    markerMax: 40,
    marker: {
      type: 'target',
      fillColor: '#999999'
    },
    markerMulti: {
      type: 'target',
      fillColor: '#333333'
    },
    theme: {
      'type': 'categorized',
      'field': 'retailer',
      'other': true,
      'cat': {
        'Tesco': {
          'label': 'Tesco',
          'fillColor': '#0055a8',
          'layers': {
            '0.75': '#ffffff',
            '0.35': '#f02f26'
          }
        },
        'Sainsburys': {
          'label': 'Sainsburys',
          'fillColor': '#ee8a00',
          'layers': {
            '0.5': '#ffffff',
            '0.35': '#ee8a00'
          }
        },
        'Marks and Spencer': {
          'label': 'Marks & Spencer',
          'fillColor': '#0a0d10',
          'layers': {
            '0.5': '#def036',
            '0.25': '#0a0d10'
          }
        }
      }
    }
  }
});

map.addLayer({
  format: 'tiles',
  key: 'base_label',
  URI: 'https://api.mapbox.com/styles/v1/dbauszus/cj9puo8pr5o0c2sovhdwhkc7z/tiles/256/{z}/{x}/{y}?&provider=MAPBOX'
});