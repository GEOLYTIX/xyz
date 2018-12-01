module.exports = async (term, locale) => {

  // Loop through dataset entries in gazetteer configuration.
  for (let dataset of locale.gazetteer.datasets) {

    // Build PostgreSQL query to fetch gazetteer results.
    var q = `
    SELECT
      ${dataset.label} AS label,
      ${locale.layers[dataset.layer].qID} AS id,
      ST_X(ST_PointOnSurface(${locale.layers[dataset.layer].geom || 'geom'})) AS lng,
      ST_Y(ST_PointOnSurface(${locale.layers[dataset.layer].geom || 'geom'})) AS lat
      FROM ${dataset.table}
      WHERE ${dataset.qterm || dataset.label} ILIKE $1
      ORDER BY length(${dataset.label})
      LIMIT 10`;

    // Get gazetteer results from dataset table.
    var rows = await global.pg.dbs[locale.layers[dataset.layer].dbs](q, [`${dataset.leading_wildcard ? '%': ''}${decodeURIComponent(term)}%`]);

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