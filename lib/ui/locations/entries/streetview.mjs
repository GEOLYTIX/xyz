export default entry => {

  const pin = entry.location.infoj.find(entry => entry.type === 'pin')

  if (!pin || !pin.value) return;

  const lnglat = ol.proj.toLonLat(
    pin.value,
    `EPSG:${pin.srid || entry.location.layer.mapview.srid}`,
    'EPSG:4326')

  const node = mapp.utils.html.node`
    <a
      target="_blank"
      href=${`https://www.google.com/maps?cbll=${lnglat[1]},${lnglat[0]}&layer=c`}>`

  mapp.utils.xhr(`${entry.location.layer.mapview.host}/api/proxy?url=${encodeURIComponent(
    `https://maps.googleapis.com/maps/api/streetview/metadata` +
    `?location=${lnglat[1]},${lnglat[0]}`+
    `&source=outdoor&{GOOGLE}`)}`)
    .then(response => {

      if (response.status !== 'OK') return;

      const src = `${entry.location.layer.mapview.host}/api/proxy?url=${encodeURIComponent(
        `https://maps.googleapis.com/maps/api/streetview` +
        `?location=${lnglat[1]},${lnglat[0]}`+
        `&source=outdoor&size=300x230&{GOOGLE}`)}`

      node.append(mapp.utils.html.node`<img src=${src}>`)

    })

  return node
}