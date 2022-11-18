export default (function(){

  mapp.ui.locations.entries.geom_plugin = entry => {

    query(entry)

    return mapp.ui.locations.entries.geometry(entry)
  }

  mapp.ui.locations.entries.json_plugin = entry => {

    json(entry)

    return mapp.ui.locations.entries.json(entry)
  }

  async function query(entry) {

    const pin = entry.location.infoj.find(entry => entry.type === 'pin')

    const response = await mapp.utils.xhr(`${entry.location.layer.mapview.host}/api/query/lad_intersect?x=${pin.value[0]}&y=${pin.value[1]}`)

    entry.value = JSON.parse(response.st_asgeojson)

    const input = entry.node.querySelector('input')

    input.disabled = false
  }

  async function json(entry) {

    const response = await mapp.utils.xhr(`${entry.location.layer.mapview.host}/api/query/lad_intersect?x=-132950.471308132&y=7280753.00798806`)

    entry.value = response

    const pre = entry.node.querySelector('pre')

    mapp.utils.render(pre, mapp.utils.html`
    <pre><code>${JSON.stringify(entry.value, null, 2)}`)
  }
  
})()