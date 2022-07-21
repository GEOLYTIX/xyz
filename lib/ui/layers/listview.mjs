import view from './view.mjs'

mapp.utils.merge(mapp.dictionaries, {
  en: {
    layer_group_hide_layers: "Toggle all layers in group",
  },
  de: {
    layer_group_hide_layers: "Umschalten aller Ebenen in Gruppe",
  },
  cn: {
    layer_group_hide_layers: "隐藏图层",
  },
  pl: {
    layer_group_hide_layers: "Ukryj warstwy z tej grupy",
  },
  ko: {
    layer_group_hide_layers: "그룹에서 레이어 숨기기",
  },
  fr: {
    layer_group_hide_layers: "Cacher les couches du groupe",
  },
  ja: {
    layer_group_hide_layers: "グループからレイヤーを隠す",
  }
})

export default function (params){

  if (!params.mapview) return

  if (!params.target) return

  const listview = {
    node: params.target,
    groups: {}
  }

  // Loop through the layers and add to layers list.
  Object.values(params.mapview.layers).forEach(layer => add(layer))

  // Loop through the layers and add to layers list.
  function add(layer){

    if (layer.hidden) return;

    // Create the layer view.
    view(layer)

    if (!layer.group) {
      listview.node.appendChild(layer.view)
      listview.node.dispatchEvent(new CustomEvent('addLayerView', {
        detail: layer
      }))
      return
    }

    // Create new layer group if group does not exist yet.
    if (!listview.groups[layer.group]) createGroup(layer)

    // Add layer to group.
    listview.groups[layer.group].addLayer(layer)

    listview.node.dispatchEvent(new CustomEvent('addLayerView', {
      detail: layer
    }))
  }

  function createGroup(layer) {

    // Create group object.
    const group = {
      list: []
    }
  
    // Assign layer group to listview object.
    listview.groups[layer.group] = group
 
    group.meta = mapp.utils.html.node`<div class="meta">`

    group.drawer = mapp.ui.elements.drawer({
      data_id: `layer-drawer`,
      class: 'layer-group',
      header: mapp.utils.html`
        <h2>${layer.group}</h2>
        <div class="mask-icon expander"></div>`,
      content: group.meta
    })

    listview.node.appendChild(group.drawer)    

    group.addLayer = (layer) => {

      layer.group = group
  
      if (layer.groupmeta) {
        const metaContent = group.meta.appendChild(mapp.utils.html.node`<div>`)
        metaContent.innerHTML = layer.groupmeta
      }
  
      group.list.push(layer)
  
      group.drawer.appendChild(layer.view)
    }
  
  }
}