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
  distinct_values_json: {
    template: require('./distinct_values_json'),
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
  field_minmax: {
    template: require('./field_minmax'),
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
  st_intersects_ab: {
    template: require('./st_intersects_ab'),
  },
  st_intersects_count: {
    template: require('./st_intersects_count'),
  },
  st_distance_ab: {
    template: require('./st_distance_ab'),
  },
  st_distance_ab_multiple: {
    template: require('./st_distance_ab_multiple'),
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
  locations_delete: {
    render: require('./locations_delete'),
  },
  location_update: {
    render: require('./location_update'),
  },
  location_count: {
    template: require('./location_count'),
    value_only: true
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