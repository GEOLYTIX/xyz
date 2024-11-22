/**
* @module /ui/layers/listview
### Listview
The ui/layers/filters module exports the listview method to mapp.ui.layers{}.

* - Dictionary entries:
*     1. layer_group_hide_layers
* @requires /dictionary
*/

/**
* Creates a listview for organizing and displaying map layers, optionally grouped
* @function listview
* @param {Object} params - Configuration parameters
* @param {Object} [params.layers] - Map of layer objects to be added to the listview
* @param {HTMLElement} [params.target] - DOM element where the listview will be rendered
* @returns {void}
* 
* @example
* mapp.ui.layers.listview({
*   layers: myLayers,
*   target: document.getElementById('layer-list')
* });
*/
export default function listview(params) {
  if (!params.layers)
    if (!params.target) return

  const listview = {
    node: params.target,
    groups: {}
  }

  // Loop through the layers and add to layers list
  Object.values(params.layers).forEach(layer => add(layer))

  /** 
   * Adds a layer to the layers list
   * @function add
   * @param {layer} layer - The layer object to add
   * @param {boolean} [layer.hidden] - If true, layer will not be added to view
   * @param {string} [layer.group] - Group name to organize layer under
   * @param {string} [layer.groupClassList] - CSS classes to apply to layer's group
   * @param {string} [layer.groupmeta] - HTML content for group metadata
   * @param {HTMLElement} layer.view - Layer's view element
   * @param {Function[]} layer.showCallbacks - Callbacks to execute when layer is shown 
   * @param {Function[]} layer.hideCallbacks - Callbacks to execute when layer is hidden
   * @fires addLayerView
   * @returns {void}
   */
  function add(layer) {
    // Do not create a layer view
    if (layer.hidden) return;

    // Create the layer view
    mapp.ui.layers.view(layer)

    if (!layer.group) {
      listview.node.appendChild(layer.view)
      listview.node.dispatchEvent(new CustomEvent('addLayerView', {
        detail: layer
      }))
      return
    }

    // Create new layer group if group does not exist yet
    if (!listview.groups[layer.group]) createGroup(layer)

    // Add layer to group
    listview.groups[layer.group].addLayer(layer)
    listview.node.dispatchEvent(new CustomEvent('addLayerView', {
      detail: layer
    }))
  }

  /** 
   * Creates a group object and assigns the layer group to the listview object
   * @function createGroup
   * @param {layer} layer - The layer object that defines the group
   * @param {string} layer.group - Name of the group to create
   * @param {string} [layer.groupClassList] - CSS classes to apply to group
   * @param {string} [layer.groupmeta] - HTML content for group metadata
   * @returns {void}
   */
  function createGroup(layer) {
    // Create group object
    const group = {
      list: []
    }

    // Assign layer group to listview object 
    listview.groups[layer.group] = group

    // Create hide all group layers button
    const hideLayers = mapp.utils.html.node`
     <button
       class="mask-icon on visibility-off"
       title=${mapp.dictionary.layer_group_hide_layers}
       onclick=${e => {
        e.target.style.visibility = 'hidden'
        group.list
          .filter(layer => layer.display)
          .forEach(layer => layer.hide())
      }}>`

    group.meta = mapp.utils.html.node`<div class="meta">`
    group.drawer = mapp.ui.elements.drawer({
      data_id: layer.group,
      class: `layer-group ${layer.groupClassList || ''}`,
      header: mapp.utils.html`
       <h2>${layer.group}</h2>
       ${hideLayers}
       <div class="mask-icon expander"></div>`,
      content: group.meta
    })

    listview.node.appendChild(group.drawer)

    /**
     * Checks if any layers in group are visible and toggles visibility button accordingly
     * @function group.chkVisibleLayer
     * @private
     */
    group.chkVisibleLayer = () => {
      hideLayers.style.visibility = group.list.some(layer => layer.display) ?
        'visible' : 'hidden'
    }

    /**
     * Adds a layer to this group
     * @function group.addLayer
     * @param {layer} layer - Layer to add to the group
     */
    group.addLayer = (layer) => {
      layer.group = group
      if (layer.groupmeta) {
        const metaContent = group.meta.appendChild(mapp.utils.html.node`<div>`)
        metaContent.innerHTML = layer.groupmeta
      }
      group.list.push(layer)
      group.drawer.appendChild(layer.view)
      group.chkVisibleLayer()
      layer.showCallbacks.push(() => group.chkVisibleLayer())
      layer.hideCallbacks.push(() => group.chkVisibleLayer())
    }
  }
}