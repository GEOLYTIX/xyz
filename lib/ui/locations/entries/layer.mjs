/**
## ui/locations/entries/layer

The entries layer module exports the default layer method.

@module /ui/locations/entries/layer
*/

/**
@function layer

@description
The layer entry method attempts to lookup a layer from the locale and will spread the infoj-entry object into a structured clone of the locale layer.

The infoj-entry effectively becomes a JSON layer which will be decorated and add the mapview.

The layer.key is a concatenated from the entry.layer [key] and the entry.location.hook.

A layer.view will be created for the decorated layer and appended to the entry.node for the location view.

@param {infoj-entry} entry type:layer entry.
@property {string} layer lookup layer key for locale.layers[].

@return {HTMLElement} Node element to hold the layer view drawer.
*/

export default function layer(entry) {

  if (entry.mapview) {

    // The layer is assumed to be decorated already.
    return;
  }

  entry.mapview = entry.location.layer.mapview

  if (entry.layer) {

    entry.key = `${entry.layer}|${entry.location.hook}`
    entry.Key = entry.layer

    const layer = entry.mapview.locale.layers
      .find(layer => layer.key === entry.layer)

    entry = {
      ...structuredClone(layer),
      ...entry
    }
  }

  entry.featureSet &&= new Set(entry.value)

  mapp.layer.decorate(entry).then(layer => {

    layer.show = showLayer;

    layer.hide = hideLayer;

    entry.mapview.layers[layer.key] = layer

    layer.display && layer.show()

    mapp.ui.layers.view(layer)

    layer.node.append(layer.view)
  })

  entry.location.removeCallbacks.push(()=>{
    entry.hide()
    delete entry.mapview.layers[entry.location.hook]
  })

  const node = mapp.utils.html.node`<div
    class="entry-layer">`

  return node
}

/**
@function showLayer

@description
A custom show [layer] method which will not update the mapp.hooks.
*/
function showLayer() {

  this.display = true;

  try {

    // Add layer to map
    this.mapview.Map.addLayer(this.L);
  } catch {
    // Will catch assertation error when layer is already added.
  }

  // Reload layer data if available.
  this.reload instanceof Function && this.reload();

  // Execute showCallbacks
  this.showCallbacks?.forEach(fn => fn instanceof Function && fn(this));
}

/**
@function hideLayer

@description
A custom hide [layer] method which will not update the mapp.hooks.
*/
function hideLayer() {

  this.display = false;

  // Remove OL layer from mapview.
  this.mapview.Map.removeLayer(this.L);

  // Execute hideCallbacks
  this.hideCallbacks?.forEach(fn => fn instanceof Function && fn(this));
}