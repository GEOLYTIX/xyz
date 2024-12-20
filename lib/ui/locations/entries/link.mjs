/** 
Dictionary entries:
- report
- link

@requires /dictionary 
*/

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
    entry.label ??= `${entry.report.label || mapp.dictionary.report}`
    entry.icon_class ??= 'mask-icon wysiwyg'
  }

  if (!entry.url) {

    console.warn(`An entry.url must be defined for the URL path.`)
    return;
  }

  // Set default label and icon_class
  entry.icon_class ??= 'mask-icon open-in-new'
  entry.label ??= `${mapp.dictionary.link}`

  // Construct href from URL + params.
  const href = entry.url + mapp.utils.paramString(entry.params)

  const node = mapp.utils.html.node`
    <div class="link-with-img">
      <div style=${entry.icon_style || ''} class=${entry.icon_class}></div>
      <a target="_blank" href=${href}>${entry.label}`

  return node
}