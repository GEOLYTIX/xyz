const fetch = require('node-fetch')

const dbs = require('./dbs')()

const sql_filter = require('./layer/sql_filter')

const Roles = require('./roles.js')

module.exports = async (req, res) => {

  const locale = req.params.workspace.locales[req.params.locale]

  // Return 406 is gazetteer is not found in locale.
  if (!locale) {
    return res.send(`Failed to evaluate 'locale' param.<br><br>
    <a href="https://geolytix.github.io/xyz/docs/develop/api/gazetteer/">Gazetteer API</a>`)
  }

  // Return 406 is gazetteer is not found in locale.
  if (!locale.gazetteer) return res.status(400).send(new Error('Gazetteer not defined for locale.'))

  // Create an empty results object to be populated with the results from the different gazetteer methods.
  let results = []

  // Locale gazetteer which can query datasources in the same locale.
  if (locale.gazetteer.datasets) await gaz_locale(req, locale, results)

  // Query Google Maps API
  if (locale.gazetteer.provider === 'GOOGLE') await gaz_google(req.params.q, locale.gazetteer, results)


  if (locale.gazetteer.provider === 'OPENCAGE') await gaz_opencage(req.params.q, locale.gazetteer, results)
  
  // Query Mapbox Geocoder API
  if (locale.gazetteer.provider === 'MAPBOX') await gaz_mapbox(req.params.q, locale.gazetteer, results)

  // Return results to client.
  res.send(results)
}

async function gaz_google(term, gazetteer, results) {

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

async function gaz_opencage(term, gazetteer, results) {

  const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(term)}`
    + `${gazetteer.countrycode ? `&countrycode=${gazetteer.countrycode}` : ''}`
    + `${gazetteer.bounds ? '&bounds=' + decodeURIComponent(gazetteer.bounds) : ''}`
    + `&${process.env.KEY_OPENCAGE}`)

  const json = await response.json()

  return json.results.map(f => (results.push({
    id: f.annotations.geohash,
    label: f.formatted,
    marker: [f.geometry.lng, f.geometry.lat],
    source: 'opencage'
  })))
}

async function gaz_mapbox(term, gazetteer, results) {

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

async function gaz_locale(req, locale, results) {

  const records = [];

  // Loop through dataset entries in gazetteer configuration.
  for (let dataset of locale.gazetteer.datasets) {

    if(dataset.minLength && decodeURIComponent(req.params.q).trim().length < dataset.minLength) continue

    const layer = locale.layers[dataset.layer]

    const roles = Roles.filter(layer, req.params.user && req.params.user.roles)

    if (!roles && layer.roles) {
       console.log("User roles: Access prohibited.")
       continue;
    }//return res.status(403).send('Access prohibited.');

    const SQLparams = [`${dataset.leading_wildcard ? '%' : ''}${phrase}`]

    const filter =
      ` ${req.params.filter && `AND ${sql_filter(JSON.parse(req.params.filter), SQLparams)}` || ''}
      ${roles && Object.values(roles).some(r => !!r)
      && `AND ${sql_filter(Object.values(roles).filter(r => !!r), SQLparams)}`
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

    let phrase = dataset.space_wildcard ? `${decodeURIComponent(req.params.q).replace(new RegExp(/  */g), '% ')}%` : `${decodeURIComponent(req.params.q)}%`;

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