module.exports = defaults = {
  locale: {
    key: 'zero',
    name: 'zero',
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
        style: {
          hidden: true
        }
      }
    },
  },
  layers: {
    tiles: {
      style: {
        hidden: true
      }
    },
    mbtiles: {
      style: {
        hidden: true
      }
    },
    mbvectortiles: {
      style: {
        hidden: true
      }
    },
    geojson: {
      srid: '4326',
      style: {
        default: {
          strokeWidth: 1,
          strokeColor: '#333333',
          fillColor: '#333333',
          fillOpacity: 0.1
        },
        highlight: {
          strokeColor: '#1F964D',
          strokeWidth: 2,
          fillColor: '#cae0b8',
          fillOpacity: 0.2
        }
      },
      filter: {},
    },
    mvt: {
      srid: '3857',
      style: {
        default: {
          strokeColor: '#333',
          fillColor: '#333',
          fillOpacity: 0.1,
          marker: {
            type: 'dot',
            fillColor: '#333'
          }
        },
        highlight: {
          strokeWidth: 2,
          strokeColor: '#1F964D',
          fillColor: '#cae0b8',
          fillOpacity: 0.2,
          marker: {
            type: 'dot',
            fillColor: '#1F964D',
            scale: 1.3
          }
        }
      },
      filter: {},
    },
    cluster: {
      srid: '4326',
      style: {
        size: 20,
        anchor: null,
        default: {
          type: 'target',
          fillColor: '#999999',
          scale: 1,
        },
        cluster: {
          scale: 1.2
        },
        highlight: {
          scale: 1.3
        }
      },
      filter: {},
    },
    grid: {
      srid: '4326',
      style: {
        theme: {
          type: 'grid'
        },
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