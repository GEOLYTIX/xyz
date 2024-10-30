/**
### /ui/layers/view

The module exports a method to create layer.view elements.

@module /ui/layers/view
*/

/**
@function layerView

@description
The layerView method will create and assign a layer.view node to the layer object.

@param {layer} layer A decorated mapp layer.
@property {Object} layer.view No layer view will be created with the view property null.
@property {Object} layer.drawer The layer view will not be in a drawer element with the drawer property null.
@property {array} [layer.panelOrder=['draw-drawer', 'dataviews-drawer', 'filter-drawer', 'style-drawer', 'meta']] The order of layer view panel elements.

@returns {layer} The layer object is returned after the layer view has been created.
*/
export default function layerView(layer) {

  // Do not create a layer view.
  if (layer.view === null) return layer;

  layer.view = mapp.utils.html.node`<div 
    data-id=${layer.key}
    class="layer-view">`

  // Create content from layer view panels and plugins
  const content = Object.keys(layer)
    .map(key => mapp.ui.layers.panels[key] && mapp.ui.layers.panels[key](layer))
    .filter(panel => typeof panel !== 'undefined')

  // Set default order for panel if not explicit in layer config.
  layer.panelOrder ??= ['draw-drawer', 'dataviews-drawer', 'filter-drawer', 'style-drawer', 'meta']

  // Sort the content array according to the data-id in the panelOrder array.
  content.sort((a, b) => {

    return layer.panelOrder.findIndex(chk => chk === a.dataset?.id)
      < layer.panelOrder.findIndex(chk => chk === b.dataset?.id)
      ? 1 : -1;
  })

  // Don't create a drawer element layer view.
  if (layer.drawer === null) {

    // Append elements directly to layer.view
    content.forEach(el => layer.view.append(el))

    return layer;
  }

  layer.zoomToExtentBtn = layer.filter.zoomToExtent
    && mapp.utils.html`<button
      data-id=zoomToExtent
      title=${mapp.dictionary.layer_zoom_to_extent}
      class="mask-icon fullscreen"
      onclick=${async e => {

        // disable button if no locations were found.
        e.target.disabled = !await layer.zoomToExtent()

        layer.show()
      }}>`

  // The displayToggle element should be on if the layer is displayed or should be displayed in zoom range.
  const displayToggleClass = `mask-icon toggle ${(layer.zoomDisplay || layer.display) ? 'on' : ''}`

  // Create layer.displayToggle button for header.
  layer.displayToggle = mapp.utils.html.node`<button
    data-id=display-toggle
    title=${mapp.dictionary.layer_visibility}
    class=${displayToggleClass}
    onclick=${e => {
      const toggle = e.target.classList.toggle('on')
      toggle ? layer.show() : layer.hide()
    }}>`

  // Create a div for the magnifying glass icon
  layer.zoomBtn = layer.tables
    && mapp.utils.html.node`<button 
      data-id="zoom-to"
      title=${mapp.dictionary.zoom_to}
      class="mask-icon search"
      onclick=${() => zoomToRange(layer)}>`

  // Add on callback for toggle button.
  layer.showCallbacks.push(() => {
    layer.displayToggle.classList.add('on')
  })

  // Remove on callback for toggle button.
  layer.hideCallbacks.push(() => {
    !layer.zoomDisplay && layer.displayToggle.classList.remove('on')
  })

  const header = mapp.utils.html`
    <h2>${layer.name || layer.key}</h2>
    ${layer.zoomToExtentBtn}
    ${layer.displayToggle}
    ${layer.zoomBtn}
    <div class="mask-icon expander"></div>`

  // An empty drawer element can not be expanded.
  const drawerClass = `layer-view raised ${layer.classList || ''} ${content.length ? '' : 'empty'}`

  layer.drawer = mapp.ui.elements.drawer({
    data_id: `layer-drawer`,
    class: drawerClass,
    header,
    content
  })

  // Render layer.drawer into layer.view
  mapp.utils.render(layer.view, layer.drawer)

  // The layer may be zoom level restricted.
  layer.tables && layer.mapview.Map.getTargetElement()
    .addEventListener('changeEnd', () => changeEnd(layer))

  return layer
}

/**
@function zoomToRange

@description
The zoomToRange method set layer.mapview zoom to be in range of the layer.tables configuration and calls the [layer.show()]{@link module:/layer/decorate~show} method.

@param {layer} layer A decorated mapp layer.
@property {Object} layer.tables The zoom range table configuration.
*/
function zoomToRange(layer) {
  const minZoom = Object.entries(layer.tables).find(entry => !!entry[1])[0]

  const maxZoom = Object.entries(layer.tables).reverse().find(entry => !!entry[1])[0]

  const view = layer.mapview.Map.getView()

  view.getZoom() < minZoom ?
    view.setZoom(minZoom) :
    view.setZoom(maxZoom)

  layer.show()
}

/**
@function changeEnd

@description
The changeEnd method is assigned to the mapview.Map changeEnd event listener for layer with a tables object.

Layer with a tables object maybe zoom restricted.

The [layer.tableCurrent()]{@link module:/layer/decorate~tableCurrent} method is called to determine whether the layer has a table configured for the current zoom level.

@param {layer} layer A decorated mapp layer.
@property {HTMLElement} layer.view The layer view element.
@property {HTMLElement} layer.displayToggle A button element which toggles the layer.display.
@property {HTMLElement} layer.zoomBtn A button element which sets the mapview into the visible zoom range for the layer.
*/
function changeEnd(layer) {

  // Get array of drawer in layer.drawer
  const drawerArray = Array.from(layer.drawer.querySelectorAll(':scope > .drawer'))

  if (layer.tableCurrent()) {

    // The zoomBtn is hidden if the layer is in range.
    layer.zoomBtn.style.display = 'none'

    // Enable layer display toggle.
    layer.displayToggle.classList.remove('disabled')

    // Enable all drawer elements in array.
    drawerArray.forEach(el => el.classList.remove('disabled'))

  } else {

    // The zoomBtn is displayed outside if the layer is out of range.
    layer.zoomBtn.style.display = 'block'

    // Collapse drawer and disable layer.view.
    layer.view.querySelector('[data-id=layer-drawer]').classList.remove('expanded')

    // Disable layer display toggle.
    layer.displayToggle.classList.add('disabled')

    // Disable all drawer elements in array.
    drawerArray.forEach(el => el.classList.add('disabled'))
  }
}
