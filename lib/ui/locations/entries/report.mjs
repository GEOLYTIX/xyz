export default entry => {

  if (!entry.report.template) return

  const href = `${entry.location.layer.mapview.host}/view/`+
  `${entry.report.template}?${mapp.utils.paramString({
      id: entry.location.id
    })}`

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