import view from './view.mjs'

mapp.utils.merge(mapp.dictionaries, {
  en: {
    layer_group_hide_layers: "Hide all layers in group",
  },
  de: {
    layer_group_hide_layers: "Ausschalten aller Ebenen in Gruppe",
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

    // Create hide all group layers button.
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
      data_id: `layer-drawer`,
      class: 'layer-group',
      header: mapp.utils.html`
        <h2>${layer.group}</h2>
        ${hideLayers}
        <div class="mask-icon expander"></div>`,
      content: group.meta
    })

    listview.node.appendChild(group.drawer)

    // Check whether some layers group are visible and toggle visible button display accordingly.
    group.chkVisibleLayer = () => {

      hideLayers.style.visibility = group.list.some(layer => layer.display) ?
        'visible' : 'hidden'
    }

    group.addLayer = (layer) => {

      layer.group = group
  
      if (layer.groupmeta) {
        const metaContent = group.meta.appendChild(mapp.utils.html.node`<div>`)
        metaContent.innerHTML = layer.groupmeta
      }
  
      group.list.push(layer)
  
      group.drawer.appendChild(layer.view)

      group.chkVisibleLayer()

      layer.showCallbacks.push(()=>group.chkVisibleLayer())

      layer.hideCallbacks.push(()=>group.chkVisibleLayer())      
    }
  
  }
}