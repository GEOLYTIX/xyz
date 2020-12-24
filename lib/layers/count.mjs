export default _xyz => async function (callback) {

  const layer = this

  const response = await _xyz.query({
    query: 'count_locations',
    locale: _xyz.locale.key,
    layer: layer,
    filter: layer.filter && layer.filter.current,
    queryparams: {
      table: layer.tableMin()
    }
  })

  console.log(response)

  if (callback) return callback(parseInt(response.count))

  return parseInt(response.count)

}