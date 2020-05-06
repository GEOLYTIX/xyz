const auth = require('../mod/auth/handler')

const provider = require('../mod/provider')

const dbs = require('../mod/dbs')()

const sql_filter = require('../mod/layer/sql_filter')

const getWorkspace = require('../mod/workspace/getWorkspace')

module.exports = async (req, res) => {

  req.params = Object.assign(req.params || {}, req.query || {})

  await auth(req, res)

  const workspace = await getWorkspace(req.params.clear_cache)

  if (workspace instanceof Error) return res.status(500).send(workspace.message)

  if (req.params.clear_cache) return res.send('/query endpoint cache cleared')

  const locale = workspace.locales[req.params.locale]

  // Return 406 is gazetteer is not found in locale.
  if (!locale) return res.send('Help text.')

  // Return 406 is gazetteer is not found in locale.
  if (!locale.gazetteer) return res.status(400).send(new Error('Gazetteer not defined for locale.'))

  // Create an empty results object to be populated with the results from the different gazetteer methods.
  let results = []

  if (req.params.source) {

    if (req.params.source === 'GOOGLE') {

      results = await gaz_google(req.params.q, locale.gazetteer)

      // Return error message _err if an error occured.
      if (results._err) return res.status(500).send(results._err)

      // Return results to client.
      return res.send(results);
    }
  }

  // Locale gazetteer which can query datasources in the same locale.
  if (locale.gazetteer.datasets) {
    results = await gaz_locale(req, locale);

    // Return error message _err if an error occured.
    if (results._err) return res.status(500).send(results._err)

    // Return and send results to client.
    if (results.length > 0) return res.send(results);
  }

  // Query Google Maps API
  if (locale.gazetteer.provider === 'GOOGLE') {
    results = await gaz_google(req.params.q, locale.gazetteer)

    // Return error message _err if an error occured.
    if (results._err) return res.status(500).send(results._err)
  }

  if (locale.gazetteer.provider === 'OPENCAGE') {
    results = await gaz_opencage(req.params.q, locale.gazetteer)
  }

  // Query Mapbox Geocoder API
  if (locale.gazetteer.provider === 'MAPBOX') {
    results = await gaz_mapbox(req.params.q, locale.gazetteer)

    // Return error message _err if an error occured.
    if (results._err) return res.status(500).send(results._err)
  }

  // Return results to client.
  res.send(results)
}

async function gaz_google (term, gazetteer) {

  //https://developers.google.com/places/web-service/autocomplete

  // Create url decorated with gazetteer options.
  const results = await provider.google(`maps.googleapis.com/maps/api/place/autocomplete/json?input=${term}`
    + `${gazetteer.code ? '&components=country:' + gazetteer.code : ''}`
    + `${gazetteer.bounds ? '&' + decodeURIComponent(gazetteer.bounds) : ''}`)
  
  // Return results to route. Zero results will return an empty array.
  return results.predictions.map(f => ({
    label: f.description,
    id: f.place_id,
    source: 'google'
  }))
}

async function gaz_opencage (term, gazetteer) {

	const results = await provider.opencage(`api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(term)}`
		+ `${gazetteer.code ? `&countrycode=${gazetteer.code}` : ''}`
		+ `${gazetteer.bounds ? '&bounds=' + decodeURIComponent(gazetteer.bounds) : ''}`)

	return results.results.map(f => ({
		id: f.annotations.geohash,
		label: f.formatted,
		marker: [f.geometry.lng, f.geometry.lat],
		source: 'opencage'
	}))
}

async function gaz_mapbox (term, gazetteer) {

  //https://www.mapbox.com/api-documentation/#search-for-places

  // Create url decorated with gazetteer options.
  const results = await provider.mapbox(`api.mapbox.com/geocoding/v5/mapbox.places/${term}.json?`
    + `${gazetteer.code ? 'country=' + gazetteer.code : ''}`
    + `${gazetteer.bounds ? '&' + gazetteer.bounds : ''}`
    + '&types=postcode,district,locality,place,neighborhood,address,poi')

  // Return results to route. Zero results will return an empty array.
  return results.features.map(f => ({
    label: `${f.text} (${f.place_type[0]}) ${!gazetteer.code && f.context ? ', ' + f.context.slice(-1)[0].text : ''}`,
    id: f.id,
    marker: f.center,
    source: 'mapbox'
  }))
}

async function gaz_locale (req, locale) {

  // Loop through dataset entries in gazetteer configuration.
  for (let dataset of locale.gazetteer.datasets) {

    const layer = locale.layers[dataset.layer]

    const roles = layer.roles && req.params.token.roles && req.params.token.roles.filter(
      role => layer.roles[role]).map(
        role => layer.roles[role]) || []
  
    const filter = await sql_filter(Object.assign(
      {},
      req.params.filter && JSON.parse(req.params.filter) || {},
      roles.length && Object.assign(...roles) || {}))

    // Build PostgreSQL query to fetch gazetteer results.
    var q = `
    SELECT
      ${dataset.label} AS label,
      ${layer.qID} AS id,
      ST_X(ST_PointOnSurface(${layer.geom || 'geom'})) AS lng,
      ST_Y(ST_PointOnSurface(${layer.geom || 'geom'})) AS lat
      FROM ${dataset.table}
      WHERE ${dataset.qterm || dataset.label}::text ILIKE $1
      ${filter}
      ORDER BY length(${dataset.label})
      LIMIT 10`

    // Get gazetteer results from dataset table.
    var rows = await dbs[layer.dbs](q, [`${dataset.leading_wildcard ? '%': ''}${decodeURIComponent(req.params.q)}%`])

    if (rows instanceof Error) return {err: 'Error fetching gazetteer results.'}

    // Format JSON array of gazetteer results from rows object.
    if (rows.length > 0) return Object.values(rows).map(row => ({
      label: row.label,
      id: row.id,
      table: dataset.table,
      layer: dataset.layer,
      marker: `${row.lng},${row.lat}`,
      source: 'glx'
    }))

  }

  // Return empty results array if no results where found in any dataset.
  return []
}