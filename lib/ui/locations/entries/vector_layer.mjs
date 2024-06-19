export default entry => {

  // Assign mapview to entry to provide shortened lookup.
  entry.mapview ??= entry.location.layer.mapview

  if (!entry.mapview) {

    console.warn(`vector_layer entry requires a mapview.`)
    return;
  }

  entry.zIndex ??= Object.keys(entry.mapview.layers).length + 1

  entry.style ??= {}

  if (entry.style.default) {

    // Assign the location style to the default style.
    entry.style.default = {...entry.location?.style, ...entry.style.default}
  }
  
  // Update entry.style config.
  mapp.layer.styleParser(entry)

  if (entry.style.themes) {

    // Assign the first theme from themes if undefined.
    entry.style.theme ??= entry.style.themes[Object.keys(entry.style.themes)[0]]
  }

  entry.elements = entry.api_elements || []

  entry.label ??= 'Vector Layer'

  // Create checkbox to control geometry display.
  entry.chkbox = mapp.ui.elements.chkbox({
    label: entry.label,
    data_id: `${entry.key}-chkbox`,
    checked: !!entry.display,
    onchange: (checked) => checked ? entry.show() : hide(entry)
  })

  entry.show ??= show

  // Show geometry if entry is set to display.
  entry.display && entry.show()

  // Create a node consistent of the chkbox and the style drawer.
  entry.panel = mapp.utils.html.node`<div>${entry.chkbox}${entry.elements}`

  // Remove zoom level check from mapview changeEnd event.
  entry.location.removeCallbacks.push(() => {

    // Remove layer from map when location is removed.
    entry.mapview.Map.removeLayer(entry.L)
  })

  // Return the node to the location view.
  return entry.panel
}

async function show() {

  this.display = true;

  // the show event maybe triggered by an API, draw, or modify interaction.
  const chkbox = this.location.view?.querySelector(`[data-id=${this.key}-chkbox] input`)

  if (chkbox) chkbox.checked = true

  if (this.mapview.Map.getLayers().getArray().includes(this.L)) {

    // The layer has already been added to the map.
    return;
  }

  // Create query paramString from the entry object.
  const paramString = mapp.utils.paramString(mapp.utils.queryParams(this))

  // Get features from query.
  this.features ??= await mapp.utils.xhr(`${this.host || this.mapview?.host || mapp.host}/api/query?${paramString}`)

  if (this.features instanceof Error) {

    console.warn('Features query failed.')
    return;
  }

  if (!this.features && this.api instanceof Function) await this.api(this)

  if (!this.features) {

    return;
  }

  // The layer already exists.
  if (this.setSource) {

    this.setSource(this.features)
  } else {

    mapp.layer.formats[this.format](this)
  }

  try {
    
    this.mapview.Map.addLayer(this.L)

  } catch {
    // Will catch assertation error when layer is already added.
  }

  this.style.panel?.remove()

  // Create a style panel as entry.style.panel and append to entry.node.
  this.style.panel = mapp.ui.layers.panels.style(this)
  this.style.panel && this.panel.append(this.style.panel)
}

function hide(entry) {

  entry.display = false

  // Hide the style drawer.
  if (entry.style.panel) entry.style.panel.style.display = 'none'

  // Remove the geometry layer from map.
  entry.mapview.Map.removeLayer(entry.L)
}