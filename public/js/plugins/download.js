export default (function(){

  mapp.ui.layers.panels.download_data = layer => {

    const btn = mapp.utils.html.node`
    <button
      class="flat wide"
      onclick=${download}>
      Download Data`

    return btn

    async function download(e) {
      let response = await mapp.utils.xhr({
        url: `${layer.mapview.host}/api/query/${layer.download_data.query}?stream=true`,
        responseType: 'arraybuffer'
      })


      var byteArray = new Uint8Array(response);

      var enc = new TextDecoder("utf-8");

      let decoded = enc.decode(byteArray)

      console.log(decoded)

      // for (var i = 0; i < byteArray.byteLength; i++) {
      //   console.log(byteArray[i])
      // }

    }

  }

  function downloadLink(layer) {

    layer.download.layer = layer

    _xyz.query(layer.download).then(response => {

      const blob = layer.download.format === 'json' && blobJson(response) || blobCSV(response)
     
      const link = mapp.utils.html.node`<a
        href=${URL.createObjectURL(blob)}
        download=${`${layer.key}.${layer.download.format || 'csv'}`}>`

      link.click()

    })
  }

  function blobJson(response) {

    const rows = response.map(record=>{

      const feature = {
        type: 'Feature',
        properties: record
      }

      feature.geometry = JSON.parse(record.geometry)

      delete feature.properties.geometry

      return feature
    })

    const json = JSON.stringify({
      type: 'FeatureCollection',
      features: rows
    })

    return new Blob([json], {type: 'application/json'})
  }

  function blobCSV(response) {

    const rows = response.map(record=>{

      return Object.values(record).map(record => {

        return isNaN(record) && `"${record}"` || record

      }).join(',')
    })
    
    const csv = rows.join('\r\n')

    return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  }

})()