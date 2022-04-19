export default async params => {

  params.id = await mapp.utils.xhr({
    method: 'POST',
    url: `${params.layer.mapview.host}/api/location/new?` +
      mapp.utils.paramString({
        locale: params.layer.mapview.locale.key,
        layer: params.layer.key,
        table: params.layer.tableCurrent()
      }),
    body: JSON.stringify({
      geometry: params.geometry
    })
  })

  return params
}