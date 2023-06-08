async function datasets(req, locale, results) {

  const records = [];

  // Loop through dataset entries in gazetteer configuration.
  for (let dataset of locale.gazetteer.datasets) {

    if (dataset.minLength && decodeURIComponent(req.params.q).trim().length < dataset.minLength) continue;

    if (!Object.hasOwn(locale.layers, dataset.layer)) continue;

    const layer = locale.layers[dataset.layer]

    if (!Roles.check(layer, req.params.user?.roles)) {
      continue;
    }

    const roles = Roles.filter(layer, req.params.user?.roles)

    //Asteriks & Leading Wild Card Expression
    let phrase = `${dataset.leading_wildcard && '%' ||''}${decodeURIComponent(req.params.q).replace(new RegExp(/\*/g), '%')}%`

    const SQLparams = [phrase]

    const filter =
      ` ${layer.filter?.default && ` AND ${layer.filter?.default}` || ''}
      ${req.params.filter && ` AND ${sqlFilter(JSON.parse(req.params.filter), SQLparams)}` || ''}
      ${dataset.filter && ` AND ${dataset.filter}` || ''}
      ${roles && Object.values(roles).some(r => !!r)
      && `AND ${sqlFilter(Object.values(roles).filter(r => !!r), SQLparams)}`
      || ''}`

    // Build PostgreSQL query to fetch gazetteer results.
    var q = `
    SELECT
      ${dataset.label} AS label,
      ${dataset.qID || layer && layer.qID || null} AS id,
      ST_X(ST_PointOnSurface(${dataset.geom || layer && layer.geom || 'geom'})) AS lng,
      ST_Y(ST_PointOnSurface(${dataset.geom || layer && layer.geom || 'geom'})) AS lat,
      '${dataset.table}' AS table,
      '${dataset.layer}' AS layer,
      '${dataset.source || 'glx'}' AS source
      FROM ${dataset.table}
      WHERE ${dataset.qterm || dataset.label}::text ILIKE $1
      ${filter}
      LIMIT ${dataset.limit || locale.gazetteer.limit || 10}`

    if (!Object.hasOwn(dbs, dataset.dbs || layer && layer.dbs || req.params.workspace.dbs)) {
      continue;
    }

    records.push(dbs[dataset.dbs || layer && layer.dbs || req.params.workspace.dbs](q, SQLparams));

  }

  if (!records.length) return;

  return Promise.all(records).then(_records => {
    for (let _record of _records) {
      if (_record instanceof Error) {
        console.log({ err: 'Error fetching gazetteer results.' });
        continue;
      }

      if (_record.length > 0) _record.map(row => {
        results.push({
          label: row.label,
          id: row.id,
          table: row.table,
          layer: row.layer,
          marker: `${row.lng},${row.lat}`,
          source: row.source || 'glx'
        });
      });

      results.sort((a, b) => a.label.toString().localeCompare(b.label));
    }
  });
}

async function layerGaz(q, layer) {

  let results = []

  // Asteriks wildcard
  let phrase = `${decodeURIComponent(q).replace(new RegExp(/\*/g), '%')}%`

  const SQLparams = [phrase]

  if (Array.isArray(layer.gazetteer.datasets)) {

    for (const _gaz of layer.gazetteer.datasets) {

      let gaz = Object.assign({}, layer.gazetteer, _gaz)

      await search(gaz)
    }

  } else {

    await search(layer.gazetteer)
  }

  return results

  async function search(gaz) {

    var q = `
    SELECT
      ${gaz.label || gaz.qterm} AS label,
      ${layer.qID} AS id,
      ST_X(ST_PointOnSurface(${layer.geom})) AS lng,
      ST_Y(ST_PointOnSurface(${layer.geom})) AS lat,
      '${gaz.table || layer.table}' AS table,
      '${layer.key}' AS layer,
      '${gaz.title || ''}' AS title,
      'glx' AS source
      FROM ${gaz.table || layer.table}
      WHERE ${gaz.qterm}::text ILIKE $1
      LIMIT ${gaz.limit || 10}`

    // Validate dynamic method call.
    if (!Object.hasOwn(dbs, layer.dbs || req.params.workspace.dbs)) return;

    let rows = await dbs[layer.dbs || req.params.workspace.dbs](q, SQLparams);

    results = results.concat(rows)
  }

}