module.exports = _ => {

  const fields = Object.keys(_.body).map(key => {

    // Value is null
    if (_.body[key] === null) {

      return `${key} = null`
    }

    // Value is string. Escape quotes.
    if (typeof _.body[key] === 'string') {

      _[key] = _.body[key].replace(/\'/gi, `''`)
    }

    // Value is geometry.
    if (_.body[key].coordinates) {

      return `${key} = ST_SetSRID(ST_MakeValid(ST_GeomFromGeoJSON('${JSON.stringify(_.body[key])}')),${_.layer.srid})`
    }

    // Value is an array (of strings)
    if (Array.isArray(_.body[key])) {

      _[key] = _.body[key] //ARRAY['${_.body[key].join("','")}']
    }

    // Value is an object and must be stringified.
    if (typeof _.body[key] === 'object') {

      _[key] = JSON.stringify(_.body[key])
    }

    // Value is boolean or number.
    if (typeof _.body[key] === 'boolean' || typeof _.body[key] === 'number') {

      _[key] = _.body[key]
    }

    return `${key} = %{${key}}`
  })

  var q = `
    UPDATE ${_.table}
    SET ${fields.join()}
    WHERE ${_.layer.qID} = %{id};`

  return q
}