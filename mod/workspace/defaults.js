module.exports = defaults = {
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
        }
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
        }
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
        }
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