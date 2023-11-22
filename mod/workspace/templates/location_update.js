module.exports = _ => {

  const fields = Object.entries(_.body)
    .map(entry => {

      if (entry[1] === null) {

        // Value is null
        return ` ${entry[0]} = null`
      }

      if (typeof entry[1] === 'string') {

        // Value is string. Escape quotes.
        return ` ${entry[0]} = '${entry[1].replace(/\'/gi, `''`)}'`
      }

      if (entry[1].coordinates) {

        // Value is geometry.
        return ` ${entry[0]} = ST_SetSRID(ST_MakeValid(ST_GeomFromGeoJSON('${JSON.stringify(entry[1])}')),${_.layer.srid})`
      }

      if (Array.isArray(entry[1])) {

        // Value is an array (of strings)
        return ` ${entry[0]} = ARRAY['${entry[1].join("','")}']`
      }

      if (typeof entry[1] === 'object') {

        // Value is an object and must be stringified.
        return ` ${entry[0]} = '${JSON.stringify(entry[1])}'`
      }

      if (typeof entry[1] === 'boolean' || typeof entry[1] === 'number') {

        // Value is boolean or number.
        return ` ${entry[0]} = ${entry[1]}`
      }
    })

  var q = `
    UPDATE ${_.table}
    SET ${fields.join()}
    WHERE ${_.layer.qID} = %{id};`

  return q
}