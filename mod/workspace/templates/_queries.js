/**
@module /workspace/templates/queries
*/

module.exports = {
  gaz_query: {
    template: require('./gaz_query'),
  },
  get_last_location: {
    render: require('./get_last_location'),
  },
  distinct_values: {
    template: require('./distinct_values'),
  },
  field_stats: {
    template: require('./field_stats'),
  },
  field_min: {
    template: require('./field_min'),
  },
  field_max: {
    template: require('./field_max'),
  },
  get_nnearest: {
    render: require('./get_nnearest'),
  },
  geojson: {
    render: require('./geojson'),
  },
  cluster: {
    render: require('./cluster'),
    reduce: true
  },
  cluster_hex: {
    render: require('./cluster_hex'),
    reduce: true
  },
  wkt: {
    render: require('./wkt'),
    reduce: true
  },
  infotip: {
    render: require('./infotip'),
  },
  layer_extent: {
    template: require('./layer_extent'),
  },
  location_get: {
    render: require('./location_get'),
  },
  location_new: {
    render: require('./location_new'),
    value_only: true
  },
  location_delete: {
    render: require('./location_delete'),
  },
  location_update: {
    render: require('./location_update'),
  },
  mvt: {
    render: require('./mvt'),
    value_only: true
  },
  mvt_geom: {
    render: require('./mvt_geom'),
    value_only: true
  }
}