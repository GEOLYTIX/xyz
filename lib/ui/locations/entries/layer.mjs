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

featureLookup is an array of properties objects which filter and style requested features.

When using query-based featureLookup the query should return unique indentifiers within their original layer and any relevant fields used for thematic styling.

A featureSet of featureLookup can be defined for the layer feature styling. The values for the featureLookup or featureSet can be defined as entry.data. The entry.data may be populated from the get feature field or queried from a parameterised entry.query [template]. A featureSet consists of an array of feature IDs. A featureLookup consists of an array of feature objects with the feature properties being assigned for styling in the [featureProperties]{@link module:/layer/featureStyle~featureProperties} style method.

@param {infoj-entry} entry type:layer entry.
@property {string} [entry.layer] lookup layer key for locale.layers[].
@property {object} [entry.data] An array of feature id or objects for the featureSet or featureLookup.
@property {string} [entry.query] A query to execute to populate the entry.data.
@property {object} [entry.featureSet] A set of feature ID to filter the layer features.
@property {object} [entry.featureLookup] Feature objects as lookup to filter the layer features.

@return {HTMLElement} Node element to hold the layer view drawer.
*/
export default function layer(entry) {
  checkData(entry);

  entry.mapview ??= entry.location.layer.mapview;

  // The layer lookup is optional. An entry maybe defined as a layer.
  if (entry.layer) {
    entry.key = entry.layer;

    // Find JSON layer in locale
    const layer = entry.mapview.locale.layers.find(
      (layer) => layer.key === entry.layer,
    );

    if (!layer) {
      console.warn(`Layer [${entry.layer}] not found in mapview.locale`);
      return;
    }

    // Filter out clone properties owned by the entry.
    const filtered = Object.keys(layer)
      .filter((key) => !Object.hasOwn(entry, key))
      .reduce((obj, key) => {
        obj[key] = layer[key];
        return obj;
      }, {});

    // Assign layer object to entry overriding entry properties.
    Object.assign(entry, filtered);

    entry.params ??= {};

    entry.params.layer_template ??= entry.layer;

    // The assignment should only happen once.
    delete entry.layer;
  }

  entry.zIndex ??= entry.location.layer.zIndex++;

  decorateLayer(entry);

  entry.panel ??= mapp.utils.html.node`<div class="entry-layer">`;

  return entry.panel;
}

/**
@function checkData

@description
The value from a [dependent] entry field will override the entry.data when the layer location entry method is called from the infoj entries iteration.

Empty array data of no features will be assigned as null.

The entry and the display_toggle checkbox will be disabled if the layer entry should use a featureSet or featureLookup array with no query and no [feature] data.

@param {infoj-entry} entry type:layer entry.
@property {object} [entry.value] Value assigned from a field in the get feature response.
@property {object} [entry.data] An array of feature id or objects for the featureSet or featureLookup.
@property {string} [entry.query] A query to execute to populate the entry.data.
@property {object} [entry.featureSet] A set of feature ID to filter the layer features.
@property {object} [entry.featureLookup] Feature objects as lookup to filter the layer features.

@return {HTMLElement} Node element to hold the layer view drawer.
*/
function checkData(entry) {
  if (entry.value !== undefined) {
    entry.data = entry.value;

    if (entry.data?.length === 0) {
      entry.data = null;
    }
  }

  if (entry.featureSet || entry.featureLookup) {
    if (!entry.query && !entry.data) {
      entry.disabled = true;
      entry.display_toggle?.classList.add('disabled');
    } else {
      entry.disabled = false;
      entry.display_toggle?.classList.remove('disabled');
    }
  }
}

/**
@function decorateLayer
@async

@description
The infoj layer entry provided as argument will be decorated to become a mapp layer.

@param {infoj-entry} entry type:layer entry.
*/
async function decorateLayer(entry) {
  // The entry [layer] has already been decorated, and its currently displayed - showLayer should be called to refresh the layer.
  if (entry.L && entry.display) {
    entry.show();
    return;
    // The entry [layer] has already been decorated, and its not currently displayed, just return.
  } else if (entry.L) {
    return;
  }

  //Assigned to keep track of the original layer key
  entry.source_key = entry.key;

  await mapp.layer.decorate(entry);

  // The entry [layer] could not be decorated.
  if (!entry.L) return;

  entry.location.Layers.push(entry);

  // Append the location id to the layer key to ensure its unique and linked to the location.
  entry.key += `-${entry.location.id}`;

  entry.L.set('key', entry.key);

  entry.show = showLayer;

  entry.hide = hideLayer;

  entry.mapview.layers[entry.key] = entry;

  entry.display_toggle = mapp.ui.elements.chkbox({
    checked: entry.display,
    data_id: `${entry.key}-display`,
    disabled: entry.disabled,
    label: entry.name,
    onchange: (checked) => {
      checked ? entry.show() : entry.hide();
    },
  });

  // The layer may be zoom level restricted.
  if (entry.tables) {
    if (!entry.tableCurrent()) entry.display_toggle.classList.add('disabled');

    entry.mapview.Map.getTargetElement().addEventListener('changeEnd', () => {
      entry.tableCurrent()
        ? entry.display_toggle.classList.remove('disabled')
        : entry.display_toggle.classList.add('disabled');
    });
  }

  // Append display_toggle to panel.
  entry.panel.append(entry.display_toggle);

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
  ];

  // Request style.panel element as content for drawer.
  entry.style.panel = mapp.ui.elements.layerStyle.panel(entry);

  if (entry.style.default) {
    // Assign the location style to the default style.
    entry.style.default = { ...entry.location?.style, ...entry.style.default };
  }

  // Append style panel to layer panel, if style is available.
  entry.style.panel && entry.panel.append(entry.style.panel);

  entry.location.removeCallbacks.push(() => {
    entry.hide();
    delete entry.mapview.layers[entry.key];
  });

  entry.display && entry.show();
}

/**
@function showLayer
@async

@description
A custom show [layer] method bound to the [layer] entry which will not update the mapp.hooks.

The showLayer method assigns the entry value as data property. A query will be executed to populate the data property otherwise. The entry will be disabled if the query does not return a response.

The featureData method is called to manage how the data should be handled as features for different layer formats.
*/
async function showLayer() {
  const entry = this;

  if (entry.query) {
    const queryParams = mapp.utils.queryParams(entry);

    const paramString = mapp.utils.paramString(queryParams);

    entry.data = await mapp.utils.xhr(
      `${entry.mapview.host}/api/query?${paramString}`,
    );

    if (!entry.data) {
      entry.disabled = true;
      entry.display_toggle?.classList.add('disabled');
      // Replace the panel with the display_toggle, as no style panel should be shown.
      entry.panel.replaceChildren(entry.display_toggle);
      return;
    }
  }

  featureData(entry);

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
  entry.showCallbacks?.forEach((fn) => fn instanceof Function && fn(entry));
}

/**
@function featureData

@description
The featureData method will shortcircuit if the layer [entry] has no data property.

The features may be defined as an featureSet in which case the features whose ID is not in the featureSet will not be styled by the [featureStyle]{@link module:/layer/featureStyle~featureProperties} method.

An array feature object can be assigned to featureLookup property. Feature properties found by their ID in the featureLookup array will be assigned to the feature.properties in the featureStyle method.

The data will be assigned as features for a vector format layer in case no featureSet or featureLookup is used.

The vector format [layer] setSource method is called with the entry.features are argument to creature vector layer features and render the layer in the mapview.
@param {infoj-entry} entry type:layer entry.
*/
function featureData(entry) {
  if (!entry.data) return;

  if (entry.featureSet) {
    const featureID = Array.isArray(entry.data) ? entry.data : [entry.data];

    entry.featureSet = new Set(featureID);
    return;
  }

  if (entry.featureLookup) {
    // featureLookup on layer must be arrays
    entry.featureLookup = Array.isArray(entry.data) ? entry.data : [entry.data];
    return;
  }

  entry.features = entry.data;

  entry.setSource(entry.features);
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
  this.hideCallbacks?.forEach((fn) => fn instanceof Function && fn(this));
}
