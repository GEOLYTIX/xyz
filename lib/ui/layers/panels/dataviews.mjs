/**
## ui/layers/panels/dataviews

The dataviews panel module exports the dataviews method.

Dictionary entries:
- layer_dataview_header

@requires /dictionary 

@requires /ui/Dataview

@module /ui/layers/panels/dataviews
*/

/**
@function dataviews

@description
### mapp.ui.layers.panels.dataviews(layer)

The dataviews method returns a drawer with checkbox elements for each dataview object in `layer.dataviews{}`.

The dataviews will be decorated with the `mapp.ui.Dataview()` method.

@param {layer} layer The decorated mapp layer object.
@property {Object} dataviews The layer dataviews.

@return {HTMLElement}
*/

export default function dataviews(layer) {

  // Return if on mobile as dataviews are not supported.
  if (mapp.utils.mobile()) return;

  // Create chkbox controls for each dataview entry.
  const dataviewChkboxes = Object.entries(layer.dataviews).map(entry => {

    // The layer.dataviews{} object may include a hide flag.
    if (typeof entry[1] !== 'object') return;

    // Assign key, host, and layer to dataview object.
    const dataview = Object.assign(entry[1],
      {
        key: entry[0],
        host: layer.mapview.host,
        layer,
      })

    // Find tabview element from data-id attribute.
    dataview.tabview = document.querySelector(`[data-id=${dataview.target}]`)

    // Return if the named tabview is not found in document.
    if (!dataview.tabview) return;

    // Assign target html element for dataview.
    dataview.target = mapp.utils.html.node`<div class="dataview-target">`

    // Assign label for dataview.chkbox
    dataview.label ??= dataview.title || dataview.key

    dataview.show ??= () => {

      // Create tab after dataview creation is complete.
      dataview.tabview.dispatchEvent(new CustomEvent('addTab', {
        detail: dataview
      }))

      // Show the dataview tab.
      dataview.show()
    }

    dataview.hide ??= () => {

      dataview.display = false

      dataview.remove()
    }

    if (mapp.ui.Dataview(dataview) instanceof Error) return;

    // Display dataview if layer and dv have display flag.
    layer.display
      && dataview.display
      && dataview.show()

    layer.showCallbacks.push(() => {
      dataview.display && dataview.show()
    })

    return dataview.chkbox
  })

  // The dataviews are created but no panel is returned.
  if (layer.dataviews.hide) return;

  // Create a drawer with the dataview chkbox controls.
  const drawer = mapp.ui.elements.drawer({
    data_id: `dataviews-drawer`,
    class: 'raised',
    header: mapp.utils.html`
      <h3>${mapp.dictionary.layer_dataview_header}</h3>
      <div class="mask-icon expander"></div>`,
    content: mapp.utils.html`${dataviewChkboxes.filter(dv => !!dv)}`
  })

  return drawer
}
