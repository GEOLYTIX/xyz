export default _xyz => function (params) {

  const layer = this
  
  // Request to get the extent of layer data.
  const xhr = new XMLHttpRequest()

  xhr.open('GET', _xyz.host + '/api/query/layer_extent?' +
    _xyz.utils.paramString({
      locale: _xyz.locale.key,
      layer: layer.key,
      table: layer.table || Object.values(layer.tables)[0] || Object.values(layer.tables)[1],
      geom: layer.geom,
      proj: layer.srid,
      srid: _xyz.mapview.srid,
      filter: layer.filter && layer.filter.current
    }))

  xhr.setRequestHeader('Content-Type', 'application/json')

  xhr.responseType = 'json'

  xhr.onload = e => {

    if (e.target.status !== 200) return

    const bounds = /\((.*?)\)/.exec(e.target.response.box2d)[1].replace(/ /g, ',')

    _xyz.mapview
      .flyToBounds(bounds.split(',')
      .map(coords => parseFloat(coords)), params)
    
  }

  xhr.send()
  
}