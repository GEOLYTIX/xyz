const fetch = require('node-fetch')

const dbs = require('./utils/dbs')()

const sqlFilter = require('./utils/sqlFilter')

const Roles = require('./utils/roles.js')

const provider = {
  GOOGLE,
  MAPBOX
}

module.exports = async (req, res) => {

  const locale = req.params.workspace.locales[req.params.locale]

  // Return 406 is gazetteer is not found in locale.
  if (!locale) {
    return res.send(`Failed to evaluate 'locale' param.<br><br>
    <a href="https://geolytix.github.io/xyz/docs/develop/api/gazetteer/">Gazetteer API</a>`)
  }

  // Create an empty results object to be populated with the results from the different gazetteer methods.
  let results = []

  // Return results for layer gazetteer.
  if (req.params.layer) {
    
    let results = await layerGaz(req.params.q, locale.layers[req.params.layer])
    
    return res.send(results)
  }

  // Locale gazetteer which can query datasources in the same locale.
  if (locale.gazetteer.datasets) await datasets(req, locale, results)

  await provider[locale.gazetteer.provider] && provider[locale.gazetteer.provider](req.params.q, locale.gazetteer, results)
  
  // Return results to client.
  res.send(results)
}

async function GOOGLE(term, gazetteer, results) {

  const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?`
    + `input=${term}`
    + `${gazetteer.country ? '&components=country:' + gazetteer.country : ''}`
    + `${gazetteer.components ? '&components=' + gazetteer.components : ''}`
    + `${gazetteer.bounds ? '&' + decodeURIComponent(gazetteer.bounds) + '&strictbounds' : ''}`
    + `&${process.env.KEY_GOOGLE}`)

  const json = await response.json()

  if (json.a_err) return;

  return json.predictions.map(f => (results.push({
    label: f.description,
    id: f.place_id,
    source: 'google'
  })))

}

async function MAPBOX(term, gazetteer, results) {

  const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${term}.json?`
    + `${gazetteer.country ? 'country=' + gazetteer.country : ''}`
    + `${gazetteer.bounds ? '&' + gazetteer.bounds : ''}`
    + `&types=postcode,district,locality,place,neighborhood,address,poi`
    + `&${process.env.KEY_MAPBOX}`)

  const json = await response.json()

  if (json._err) return;

  return json.features.map(f => (results.push({
    label: `${f.text} (${f.place_type[0]}) ${!gazetteer.country && f.context ? ', ' + f.context.slice(-1)[0].text : ''}`,
    id: f.id,
    marker: f.center,
    source: 'mapbox'
  })))
}

async function datasets(req, locale, results) {

  const records = [];

  // Loop through dataset entries in gazetteer configuration.
  for (let dataset of locale.gazetteer.datasets) {

    if(dataset.minLength && decodeURIComponent(req.params.q).trim().length < dataset.minLength) continue

    const layer = locale.layers[dataset.layer]

    if (!Roles.check(layer, req.params.user?.roles)) {
      continue;
    }

    const roles = Roles.filter(layer, req.params.user?.roles)

    // Asteriks wildcard
    let phrase = `${decodeURIComponent(req.params.q).replace(new RegExp(/\*/g), '%')}%`

    //console.log(phrase)

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

    records.push(dbs[dataset.dbs || layer && layer.dbs](q, SQLparams));

  }

  if(!records.length) return;

  return Promise.all(records).then(_records => {
    for(let _record of _records){
      if(_record instanceof Error) {
        console.log({ err: 'Error fetching gazetteer results.' });
        continue;
      }

      if(_record.length > 0) _record.map(row => {
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

    let rows = await dbs[layer.dbs](q, SQLparams);

    results = results.concat(rows)
  }

}