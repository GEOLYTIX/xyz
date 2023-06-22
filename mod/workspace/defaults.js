module.exports = defaults = {
  locale: {
    key: 'zero',
    name: 'zero',
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
    geojson: {
      srid: '4326',
      style: {
        default: {
          strokeColor: '#333',
          fillColor: '#fff1',
          icon: {
            type: 'dot'
          }
        },
        highlight: {}
      },
      filter: {},
    },
    wkt: {
      srid: '4326',
      style: {
        default: {
          strokeColor: '#333',
          fillColor: '#fff1',
          icon: {
            type: 'dot'
          }
        },
        highlight: {}
      },
      filter: {},
    },
    mvt: {
      srid: '3857',
      style: {
        default: {
          strokeColor: '#333',
          fillColor: '#fff1',
          icon: {
            type: 'dot'
          }
        },
        highlight: {}
      },
      filter: {},
    },
    cluster: {
      srid: '4326',
      style: {       
        default: {
          type: 'dot'
        },
        cluster: {
          clusterScale: 2
        },
        highlight: {}
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