module.exports = {
  workspace: {
    title: 'GEOLYTIX | XYZ',
    locales: {
      zero: {},
    },
  },
  locale: {
    attribution: {
      'XYZ #v1.4.1': 'https://github.com/GEOLYTIX/xyz/releases/tag/v1.4.1',
      Leaflet: 'https://leafletjs.com',
    },
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
        display: true,
        format: 'tiles',
        URI: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      },
    },
  },
  layers: {
    tiles: {},
    geojson: {
      filter: {},
      geom: 'geom',
      style: {
        default: {
          weight: 1,
          color: '#333333',
          fill: true,
          fillColor: '#333333',
          fillOpacity: 0.1,
        },
        highlight: {
          stroke: true,
          color: '#009900',
          weight: 2,
          fillColor: '#ccff99',
          fillOpacity: 0.2,
          fill: true,
        },
        themes: {},
      },
    },
    mvt: {
      filter: {},
      geom_3857: 'geom_3857',
      style: {
        default: {
          weight: 1,
          color: '#333333',
          fill: true,
          fillColor: '#333333',
          fillOpacity: 0.1,
        },
        highlight: {
          weight: 2,
          color: '#009900',
          fill: true,
          fillColor: '#ccff99',
          fillOpacity: 0.2,
        },
        themes: {},
      },
    },
    cluster: {
      filter: {},
      geom: 'geom',
      cluster_kmeans: 0.05,
      cluster_dbscan: 0.01,
      style: {
        markerMin: 20,
        markerMax: 40,
        anchor: [],
        marker: {
          type: 'target',
          fillColor: '#999999',
        },
        markerMulti: {
          type: 'target',
          fillColor: '#333333',
        },
        themes: {},
      },
    },
    grid: {
      geom: 'geom',
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
};