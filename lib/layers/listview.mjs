export default _xyz => {

  return {

    init: init

  }

  function init(params) {

    // Assign the node for the layers listview.
    _xyz.layers.listview.node = params.target

    // Reset groups.
    _xyz.layers.listview.groups = {}

    // Loop through the layers and add to layers list.
    Object.values(_xyz.layers.list).forEach(layer => {

      // Create the layer view.
      _xyz.layers.view.create(layer)

      if (!layer.group) {
        _xyz.layers.listview.node.appendChild(layer.view)
        return
      }

      // Create new layer group if group does not exist yet.
      if (!_xyz.layers.listview.groups[layer.group]) createGroup(layer)

      // Add layer to group.
      _xyz.layers.listview.groups[layer.group].addLayer(layer)
    
    })

  }


  function createGroup (layer){

    // Create group object.
    const group = {
      list: []
    }

    // Assign layer group to listview object.
    _xyz.layers.listview.groups[layer.group] = group

    // Create layer group node and append to listview node.
    const drawer = _xyz.layers.listview.node.appendChild(
      _xyz.utils.html.node`<div class="drawer layer-group expandable">`)

    // Create layer group header.
    const header = drawer.appendChild(_xyz.utils.html.node`
      <div
        class="header enabled"
        onclick=${e=>{
          e.stopPropagation();
          _xyz.utils.toggleExpanderParent(e.target, true);
        }}>
        <span>${layer.group}`)

    // Create layer group meta element.
    const meta = drawer.appendChild(_xyz.utils.html.node`<div class="meta">`)

    // Check whether some layers group are visible and toggle visible button display accordingly.
    group.chkVisibleLayer = () => {

      group.list.some(layer => layer.display) ?
        hideLayers.classList.add('on') :
        hideLayers.classList.remove('on')
    }

    group.addLayer = layer => {

      layer.groupmeta && meta.appendChild(_xyz.utils.html.node`<div>${layer.groupmeta}`)

      group.list.push(layer)

      drawer.appendChild(layer.view)

      group.chkVisibleLayer()
    }

    // Create hide all group layers button.
    const hideLayers = header.appendChild(_xyz.utils.html.node`
      <button
        class="btn-header xyz-icon icon-toggle"
        title=${_xyz.language.layer_group_hide_layers}
        onclick=${e=>{
          e.stopPropagation()
          e.target.classList.toggle('on')

          if (e.target.classList.contains('on')) {
            group.list
              .filter(layer => !layer.display)
              .forEach(layer => layer.show())
            return
          }
          
          group.list
            .filter(layer => layer.display)
            .forEach(layer => layer.remove())

        }}>`)

    // Create group expander button.
    header.appendChild(_xyz.utils.html.node`
      <button 
        class="xyz-icon btn-header icon-expander"
        title=${_xyz.language.layer_group_toggle}
        onclick=${ e => {
          e.stopPropagation()
          _xyz.utils.toggleExpanderParent(e.target)
        }}>`)

  }

}