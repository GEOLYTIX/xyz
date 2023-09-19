export default entry => {

  // Ensure that params are set for link generation
  entry.params ??= {}

  if (entry.report) {

    // Assign URL path for report.
    entry.url ??= `${entry.location.layer.mapview.host}/view?`

    // Assign URL params for report.
    Object.assign(entry.params, {
      template: entry.report.template,
      id: entry.location.id,
      layer: entry.location.layer.key,
      locale: entry.location.layer.mapview.locale.key
    })

    // Assign entry.label for link text.
    entry.label ??= entry.report.label || 'Report'
    entry.icon_class ??= 'mask-icon wysiwyg'
  }

  // Set default label and icon_class
  entry.icon_class ??= 'mask-icon open-in-new'
  entry.label ??= 'Label'

  // Construct href from URL + params.
  const href = entry.url + mapp.utils.paramString(entry.params)

  const node = mapp.utils.html.node`
    <div class="link-with-img">
      <div class=${entry.icon_class}></div>
      <a target="_blank" href=${href}>${entry.label}`

  return node
}