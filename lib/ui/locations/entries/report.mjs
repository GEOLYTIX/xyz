export default entry => {

  if (!entry.report.template) return

  const href = `${entry.location.layer.mapview.host}/view/`+
  `${entry.report.template}?${mapp.utils.paramString(Object.assign({
      id: entry.location.id,
      layer: entry.location.layer.key,
      locale: entry.location.layer.mapview.locale.key
    }, entry.params || {}))}`

  const node = mapp.utils.html.node`
    <div class="link-with-img">
      <div
        class="mask-icon wysiwyg">
      </div>	
      <a
        target="_blank"
        href=${href}>${entry.report.label || 'Report'}`

  return node
}