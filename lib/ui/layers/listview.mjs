/**
## /ui/layers/listview 

The module exports the default listview method.

@requires /mapp/ui/layers/view

@module /ui/layers/listview
*/

/**
@function listview

@description
Creates a listview for organizing and displaying map layers, optionally grouped.

A HTMLelement target property must be provided for the listview element to be rendered into.

An initial list of decorated mapview layers is optional since layers can be added to the listview object through the add method.

The listview method is a decorator which returns the decorated listview object.

```js
mapp.ui.layers.listview({
  layers: mapview.layers,
  target: document.getElementById('layer-list')
});
```

@param {Object} params - Configuration parameters
@property {HTMLElement} params.target DOM element where the listview will be rendered
@property {Object} [params.layers] - Map of layer objects to be added to the listview
*/
export default function listview(params) {
  if (!params.target) return;

  const listview = {
    node: params.target,
    groups: {},
    add,
    createGroup,
  };

  if (
    typeof params.layers === 'object' &&
    Object.values(params.layers).length
  ) {
    // Loop through the layers and add to layers list
    Object.values(params.layers).forEach((layer) => listview.add(layer));
  }

  return listview;
}

/** 
@function add

@description
The add method creates a layer.view and adds this to the listview.

@param {layer} layer - The layer object to add
@property {boolean} [layer.hidden] Do not create a layer.view and shortcircuit.
@property {string} [layer.group] Create a layer group and or add the layer to an existing listview.group
@fires addLayerView
*/
function add(layer) {
  // Do not create a layer view
  if (layer.hidden) return;

  // Create the layer view
  mapp.ui.layers.view(layer);

  if (!layer.group) {
    this.node.appendChild(layer.view);
    this.node.dispatchEvent(
      new CustomEvent('addLayerView', {
        detail: layer,
      }),
    );
    return;
  }

  // Create new layer group if group does not exist yet
  if (!this.groups[layer.group]) this.createGroup(layer);

  // Add layer to group
  this.groups[layer.group].addLayer(layer);
  this.node.dispatchEvent(
    new CustomEvent('addLayerView', {
      detail: layer,
    }),
  );
}

/** 
@function createGroup
@description 
Creates groups in the layer listview.

Specifying `group_drawer: false` in any of the members of the group will prevent the creation of a drawer for the group.

@param {layer} layer The layer to add to a group.
@property {string} layer.group Group key.
@property {string} [layer.groupClassList] CSS classes to apply to group
@property {string} [layer.groupmeta] HTML content for group metadata
*/
function createGroup(layer) {
  // Create group object
  const group = {
    list: [],
  };

  group.group_drawer ??=
    Object.entries(layer.mapview.layers)
      .filter((key) => key[1].group === layer.group)
      .find((key) => key[1].group_drawer === false)?.[1]?.group_drawer ?? true;

  // Assign layer group to listview object
  this.groups[layer.group] = group;

  // Create hide all group layers button
  group.hideLayers = mapp.utils.html.node`<button
  class="material-symbols-outlined active"
    title=${mapp.dictionary.layer_group_hide_layers}
    onclick=${(e) => {
      e.target.style.visibility = 'hidden';
      group.list
        .filter((layer) => layer.display)
        .forEach((layer) => layer.hide());
    }}>visibility_off`;

  group.meta = mapp.utils.html.node`<div class="meta">`;

  group.chkVisibleLayer = chkVisibleLayer;

  group.addLayer = addLayerToGroup;

  if (group.group_drawer === false) {
    group.drawer = mapp.utils.html.node`<div class="drawer layer-group">
                <div class="header">
                    <h2>${layer.group}</h2>
                    ${group.hideLayers}
                  </div>
                  ${group.meta}
                </div>`;

    group.node = mapp.utils.html.node`
              <div class="layer-view" data-id=${layer.group}>
                ${group.drawer}
              </div>`;
    this.node.appendChild(group.node);
    return;
  }

  group.drawer = mapp.ui.elements.drawer({
    data_id: layer.group,
    class: `layer-group ${layer.groupClassList || ''}`,
    header: mapp.utils.html`
         <h2>${layer.group}</h2>
         ${group.hideLayers}
         <div class="material-symbols-outlined caret"/>`,
    content: group.meta,
  });

  this.node.appendChild(group.drawer);
}

/**
@function addLayer
@description
Adds a layer to group [this].
@param {layer} layer Layer to add to the group
*/
function addLayerToGroup(layer) {
  if (layer.groupmeta) {
    const metaContent = this.meta.appendChild(mapp.utils.html.node`<div>`);
    metaContent.innerHTML = layer.groupmeta;
  }

  this.list.push(layer);
  this.drawer.appendChild(layer.view);
  this.chkVisibleLayer();
  layer.showCallbacks.push(() => this.chkVisibleLayer());
  layer.hideCallbacks.push(() => this.chkVisibleLayer());
}

/**
@function chkVisibleLayer
@description
Checks if any layers in group are visible and toggles visibility button accordingly
*/
function chkVisibleLayer() {
  this.hideLayers.style.visibility = this.list.some((layer) => layer.display)
    ? 'visible'
    : 'hidden';
}
