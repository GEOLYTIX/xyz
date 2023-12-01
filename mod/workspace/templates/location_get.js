module.exports = _ => {

  const fields = _.layer.infoj
    .filter(entry => !_.fields || _.fields?.split(',').includes(entry.field))
    .filter(entry => !entry.query)
    .filter(entry => entry.type !== 'key')
    .filter(entry => entry.field)
    .map(entry => `(${entry.fieldfx || entry.field}) AS ${entry.field}`)

  return `
    SELECT ${fields.join()}
    FROM ${_.table}
    WHERE ${_.layer.qID} = %{id}`
}