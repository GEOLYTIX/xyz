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
@property {string} [entry.layer] lookup layer key for locale.layers[].

@return {HTMLElement} Node element to hold the layer view drawer.
*/
export default function layer(entry) {

  entry.mapview ??= entry.location.layer.mapview

  //An entry needs to have a featureLookup array as it's used in the show method,
  entry.featureLookup ??= []

  // The layer lookup is optional. An entry maybe defined as a layer.
  if (entry.layer) {

    // The layer.key must be unique.
    entry.key = `${entry.layer}|${entry.location.hook}`

    // The locale layer key.
    entry.Key = entry.layer

    // Find JSON layer in locale
    const layer = entry.mapview.locale.layers
      .find(layer => layer.key === entry.layer)

    if (!layer) {

      console.warn(`Layer [${entry.layer}] not found in mapview.locale`)
      return;
    }

    // Spread locale layer into entry.
    entry = {
      ...structuredClone(layer),
      ...entry
    }

    // The assignment should only happen once.
    delete entry.layer
  }

  entry.zIndex ??= entry.location.layer.zIndex++

  entry.show ?? decorateLayer(entry)

  entry.panel ??= mapp.utils.html.node`<div class="entry-layer">`

  return entry.panel
}

/**
@function decorateLayer
@async

@description
The infoj layer entry provided as argument will be decorated to become a mapp layer.

@param {infoj-entry} entry type:layer entry.
*/
async function decorateLayer(entry) {

  await mapp.layer.decorate(entry)

  entry.show = showLayer;

  entry.hide = hideLayer;

  entry.mapview.layers[entry.key] = entry

  entry.display_toggle = mapp.ui.elements.chkbox({
    data_id: `${entry.key}-display`,
    label: entry.name,
    checked: entry.display,
    onchange: (checked) => {
      checked ? entry.show() : entry.hide()
    }
  })


  // The layer may be zoom level restricted.
  if (entry.tables) {

    if (!entry.tableCurrent()) entry.display_toggle.classList.add('disabled');

    entry.mapview.Map.getTargetElement().addEventListener('changeEnd', () => {

      entry.tableCurrent()
        ? entry.display_toggle.classList.remove('disabled')
        : entry.display_toggle.classList.add('disabled')
    })
  }

  // Append display_toggle to panel.
  entry.panel.append(entry.display_toggle)

  // Append meta panel to layer panel, if meta is available.
  entry.meta && entry.panel.append(mapp.ui.layers.panels.meta(entry));

  // Nullish assign style elements to entry.
  entry.style.elements ??= [
    'labels',
    'label',
    'hovers',
    'hover',
    'icon_scaling',
    'opacitySlider',
    'themes',
    'theme',
  ]

  // Request style.panel element as content for drawer.
  entry.style.panel = mapp.ui.elements.layerStyle.panel(entry)

  if (entry.style.default) {

    // Assign the location style to the default style.
    entry.style.default = {...entry.location?.style, ...entry.style.default}
  }
  
  // Append style panel to layer panel, if style is available.
  entry.style.panel && entry.panel.append(entry.style.panel)

  entry.location.removeCallbacks.push(() => {
    entry.hide()
    delete entry.mapview.layers[entry.key]
  })

  entry.display && entry.show()
}

/**
@function showLayer
@async

@description
A custom show [layer] method bound to the [layer] entry which will not update the mapp.hooks.

The showLayer method assigns the entry value as data property. A query will be executed to populate the data property otherwise. The entry will be disabled if the query does not return a response.

The features may be defined as an featureSet in which case the features whose ID is not in the featureSet will not be styled by the [featureStyle]{@link module:/layer/featureStyle~featureProperties} method.

An array feature object can be assigned to featureLookup property. Feature properties found by their ID in the featureLookup array will be assigned to the feature.properties in the featureStyle method.
*/
async function showLayer() {

  const entry = this

  entry.data = entry.value

  if (!entry.data && entry.query) {

    const paramString = mapp.utils.paramString(mapp.utils.queryParams(entry))

    entry.data = await mapp.utils.xhr(`${entry.mapview.host}/api/query?${paramString}`)

    if (!entry.data) {

      entry.view.classList.add('disabled')
      return;
    }
  }

  if (entry.featureSet && Array.isArray(entry.data)) {

    // layer entry may have featureLookup or featureSet but not both.
    delete entry.featureLookup
    entry.featureSet = new Set(entry.data)

  } else {

    // featureLookup on layer must be arrays
    entry.featureLookup = Array.isArray(entry.data) ? entry.data : [entry.data]
  }

  entry.display = true;

  try {

    // Add layer to map
    entry.mapview.Map.addLayer(entry.L);
  } catch {
    // Will catch assertation error when layer is already added.
  }

  // Reload layer data if available.
  entry.reload instanceof Function && entry.reload();

  // Execute showCallbacks
  entry.showCallbacks?.forEach(fn => fn instanceof Function && fn(entry));
}

/**
@function hideLayer

@description
A custom hide [layer] method bound to the [layer] entry which will not update the mapp.hooks.
*/
function hideLayer() {

  this.display = false;

  // Remove OL layer from mapview.
  this.mapview.Map.removeLayer(this.L);

  // Execute hideCallbacks
  this.hideCallbacks?.forEach(fn => fn instanceof Function && fn(this));
}
