const env = require(global.__approot + '/mod/env');

module.exports = async (req, locale) => {

  const term = req.query.q;

  // Loop through dataset entries in gazetteer configuration.
  for (let dataset of locale.gazetteer.datasets) {

    const layer = locale.layers[dataset.layer];

    req.params.token.roles = req.params.token.roles || [];

    if (layer.roles) {

      if (!(layer.roles && Object.keys(layer.roles).some(
        role => req.params.token.roles.includes(role)
      ))) return [];

    }


    // Parse filter from query string.
    const filter = {};

    // Apply role filter
    req.params.token.roles.filter(
      role => layer.roles[role]).forEach(
      role => Object.assign(filter, layer.roles[role])
    );

    const filter_sql = filter && await require(global.__approot + '/mod/pg/sql_filter')(filter) || '';

    // Build PostgreSQL query to fetch gazetteer results.
    var q = `
    SELECT
      ${dataset.label} AS label,
      ${layer.qID} AS id,
      ST_X(ST_PointOnSurface(${layer.geom || 'geom'})) AS lng,
      ST_Y(ST_PointOnSurface(${layer.geom || 'geom'})) AS lat
      FROM ${dataset.table}
      WHERE ${dataset.qterm || dataset.label} ILIKE $1
      ${filter_sql}
      ORDER BY length(${dataset.label})
      LIMIT 10`;

    // Get gazetteer results from dataset table.
    var rows = await env.pg.dbs[layer.dbs](q, [`${dataset.leading_wildcard ? '%': ''}${decodeURIComponent(term)}%`]);

    if (rows.err) return {err: 'Error fetching gazetteer results.'};

    // Format JSON array of gazetteer results from rows object.
    if (rows.length > 0) return Object.values(rows).map(row => ({
      label: row.label,
      id: row.id,
      table: dataset.table,
      layer: dataset.layer,
      marker: `${row.lng},${row.lat}`,
      source: 'glx'
    }));

  }

  // Return empty results array if no results where found in any dataset.
  return [];
};