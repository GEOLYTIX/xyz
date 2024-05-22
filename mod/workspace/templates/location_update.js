module.exports = _ => {

  const fields = Object.keys(_.body).map(key => {

    // Value is null
    if (_.body[key] === null) {

      return `${key} = null`
    }

    // Value is string. Escape quotes.
    if (typeof _.body[key] === 'string') {

      _[key] = _.body[key].replace(/'/gi, `''`)
    }

    // Value is geometry.
    if (_.body[key].coordinates) {

      return `${key} = ST_SetSRID(ST_MakeValid(ST_GeomFromGeoJSON('${JSON.stringify(_.body[key])}')),${_.layer.srid})`
    }

    // Value is an object and must be stringified.
    if (typeof _.body[key] === 'object' && !Array.isArray(_.body[key])) {
      
      _[key] = JSON.stringify(_.body[key])
      if (_.body[key]['jsonb']) {

        const jsonb = _.body[key]['jsonb']

        const jsonb_field = Object.keys(jsonb)[0]

        let updateObject = []
        Object.keys(jsonb[jsonb_field]).forEach( key => {
          let value = typeof jsonb[jsonb_field][key] === 'string' ? `"${jsonb[jsonb_field][key]}"`: jsonb[jsonb_field][key]
          updateObject.push(`"${key}":${value}`)
        })

        return `${jsonb_field} = coalesce(json_field::jsonb,'{}'::jsonb)::jsonb || '{${updateObject.join(',')}}'::jsonb`
      }      
    }

    // Value is an array (of strings)
    if (Array.isArray(_.body[key])) {

      _[key] = `{${_.body[key].join(',')}}`
    }

    // Value is boolean or number.
    if (typeof _.body[key] === 'boolean' || typeof _.body[key] === 'number') {

      _[key] = _.body[key]
    }

    return `${key} = %{${key}}`
  })

  return `
    UPDATE ${_.table}
    SET ${fields.join()}
    WHERE ${_.layer.qID} = %{id};`
}