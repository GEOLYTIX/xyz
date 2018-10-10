module.exports = { autocomplete, googleplaces };

async function autocomplete(req, res, fastify) {

  const token = req.query.token ?
    fastify.jwt.decode(req.query.token) : { access: 'public' };

  let locale = global.workspace[token.access].config.locales[req.query.locale];

  if (!locale.gazetteer) return res.code(406).send('Parameter not acceptable.');

  if (!res.sent && locale.gazetteer.datasets) await placesAutoComplete(req, res, locale, fastify);

  if (!res.sent && locale.gazetteer.provider) await eval(locale.gazetteer.provider + '_placesAutoComplete')(req, res, locale.gazetteer);

  //if (!res.sent) res.code(200).send([{label: 'no results'}]);
  if (!res.sent && !locale.gazetteer.provider) res.code(200).send([]);
}

async function placesAutoComplete(req, res, locale, fastify) {
  for (let dataset of locale.gazetteer.datasets) {
    var q = `
        SELECT
            ${dataset.label} AS label,
            ${locale.layers[dataset.layer].qID || 'id'} AS id,
            ST_X(ST_PointOnSurface(${locale.layers[dataset.layer].geom || 'geom'})) AS lng,
            ST_Y(ST_PointOnSurface(${locale.layers[dataset.layer].geom || 'geom'})) AS lat
            FROM ${dataset.table}
            WHERE ${dataset.qterm || dataset.label} ILIKE $1
            ORDER BY length(${dataset.label})
            LIMIT 10`;

    var db_connection = await fastify.pg[locale.layers[dataset.layer].dbs].connect();
    var result = await db_connection.query(q,[`${dataset.leading_wildcard ? '%': ''}${decodeURIComponent(req.query.q)}%`]);
    db_connection.release();

    if (result.rows.length > 0) {
      res.code(200).send(Object.values(result.rows).map(row => {
        return {
          label: row.label,
          id: row.id,
          table: dataset.table,
          layer: dataset.layer,
          marker: `${row.lng},${row.lat}`,
          source: 'glx'
        };
      }));
      break;
    }
  }
}

function MAPBOX_placesAutoComplete(req, res, gazetteer) {
  var q = `https://api.mapbox.com/geocoding/v5/mapbox.places/${req.query.q}.json?`
        + `${gazetteer.code ? 'country=' + gazetteer.code : ''}`
        + `${gazetteer.bounds ? 'bbox=' + gazetteer.bounds : ''}`
        + '&types=postcode,district,locality,place,neighborhood,address,poi'
        + `&${global.KEYS[gazetteer.provider]}`;

  require('request').get(q, (err, response, body) => {
    if (err) {
      console.error(err);
      return;
    }

    if (response.statusCode === 422) {
      console.log(JSON.parse(body).message);
      return;
    }

    res.code(200).send(JSON.parse(body).features.map(f => {
      return {
        label: `${f.text} (${f.place_type[0]}) ${!gazetteer.code && f.context ? ', ' + f.context.slice(-1)[0].text : ''}`,
        id: f.id,
        marker: f.center,
        source: 'mapbox'
      };
    }));
  });
}

function GOOGLE_placesAutoComplete(req, res, gazetteer) {
  var q = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${req.query.q}`
        + `${gazetteer.code ? '&components=country:' + gazetteer.code : ''}`
        + `${gazetteer.bounds ? decodeURIComponent(gazetteer.bounds) : ''}`
        + `&${global.KEYS[gazetteer.provider]}`;

  require('request').get(q, (err, response, body) => {
    if (err) {
      console.error(err);
      return;
    }

    res.code(200).send(JSON.parse(body).predictions.map(f => {
      return {
        label: f.description,
        id: f.place_id,
        source: 'google'
      };
    }));
  });
}

function googleplaces(req, res) {
  var q = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${req.query.id}`
        + `&${global.KEYS.GOOGLE}`;

  require('request').get(q, (err, response, body) => {
    if (err) {
      console.error(err);
      return;
    }

    let r = JSON.parse(body).result;
    res.code(200).send({
      type: 'Point',
      coordinates: [r.geometry.location.lng, r.geometry.location.lat]
    });
  });
}