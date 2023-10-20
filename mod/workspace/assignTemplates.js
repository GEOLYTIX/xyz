module.exports = async (workspace) => {

  // Assign default view and query templates to workspace.
  workspace.templates = Object.assign(
    {
      // Query templates:
      gaz_query: {
        template: require('./templates/gaz_query'),
      },
      get_last_location: {
        template: require('./templates/get_last_location'),
      },
      distinct_values: {
        template: require('./templates/distinct_values'),
      },
      field_stats: {
        template: require('./templates/field_stats'),
      },
      field_min: {
        template: require('./templates/field_min'),
      },
      field_max: {
        template: require('./templates/field_max'),
      },
      get_nnearest: {
        render: require('./templates/get_nnearest'),
      },
      geojson: {
        render: require('./templates/geojson'),
      },
      cluster: {
        render: require('./templates/cluster'),
        reduce: true
      },
      cluster_hex: {
        render: require('./templates/cluster_hex'),
        reduce: true
      },
      wkt: {
        render: require('./templates/wkt'),
        reduce: true
      },
      infotip: {
        render: require('./templates/infotip'),
      },
      layer_extent: {
        template: require('./templates/layer_extent'),
      },
      mvt_cache: {
        admin: true,
        render: require('./templates/mvt_cache'),
      },
      mvt_cache_delete_intersects: {
        template: require('./templates/mvt_cache_delete_intersects'),
      },

      // Default templates can be overridden by assigning a template with the same name.
    },
    workspace.templates
  );
};
