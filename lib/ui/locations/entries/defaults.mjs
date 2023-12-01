export default entry => {

  let val = entry.value

  if (!val) {

    val = entry.defaults === 'user' && mapp.user?.email || entry.nullValue

    if (val) {
 
      mapp.utils.xhr({
        method: 'POST',
        url: `${entry.location.layer.mapview.host}/api/query?` +
          mapp.utils.paramString({
            template: 'location_update',
            locale: entry.location.layer.mapview.locale.key,
            layer: entry.location.layer.key,
            table: entry.location.layer.table,
            id: entry.location.id,
          }),
        body: JSON.stringify({
          [entry.field]: val
        }),
      });

    }
  }

  const node = mapp.utils.html.node`
    <div
      class="val"
      style="${`${entry.css_val || ''}`}">
      ${entry.prefix}${val}${entry.suffix}`

  return node
}