/**
### /ui/layers/view

The module exports a method to create layer.view elements.

@requires /ui/layers/viewHeader

@module /ui/layers/view
*/

/**
@function layerView

@description
The layerView method will create and assign a layer.view node to the layer object.

Specifying `layer.drawer: false` create a drawer card for the layer view. The drawer cannot be collapsed.

@param {layer} layer
@property {Object} [layer.view] The layerView method will shortcircuit if the layer.view property is null.
@property {Object} [layer.drawer] The layerView method will shortcircuit after executing the viewConfig method is the layer.drawer property is null.
*/
export default function layerView(layer) {
  // Do not create a layer view.
  if (layer.view === null) return;

  viewConfig(layer);

  const header = mapp.utils.html`
    <h2>${layer.name}</h2>
    ${layer.viewConfig.headerBtn}`;

  layer.view = mapp.ui.elements.drawer({
    drawer: layer.viewConfig.drawer,
    data_id: layer.key,
    class: layer.viewConfig.classList,
    header,
    content: layer.viewConfig.content,
    popout: layer.viewConfig.popoutBtn,
  });

  layer.changeEndCallbacks.push(changeEnd);
}

/**
@function viewConfig

@description
The viewConfig method will create viewConfig object and update the configuration from legacy properties.

The method will iterate through the panelOrder keys to add panel to the content array.

The method will iterate through the headerOrder keys to and execute methods from mapp.ui.layers.viewHeader{} to return elements for the headerBtn array.

@param {layer} layer
@property {Array} [layer.tables] Array of data tables for different zoom level.
@property {Object} [layer.viewConfig] Control options for elements in the layer.view.
@property {Boolean} [viewConfig.displayToggle=true] Controls whether the layer toggle close is displayed.
@property {Boolean} [viewConfig.zoomBtn=true] Controls whether the zoom magnifying glass is displayed.
@property {Boolean} [viewConfig.hideDisabled=false] Controls whether the layer view is hidden when layer is outside its zoom range. When set to true layer will be temporarily hidden in the list until it's within restricted zoom again.
@property {Boolean} [viewConfig.zoomToFilteredExtentBtn=true] Controls whether the zoom to extent button is displayed.
@property {Array} [viewConfig.panelOrder=['draw-drawer', 'dataviews-drawer', 'filter-drawer', 'style-drawer', 'meta']] Controls which panels are added to the view and in which order, will be assigned from layer.panelOrder if not explicit.
@property {string} [viewConfig.classList] Classlist string to be added to layer-view drawer element classList.
@property {Array} [viewConfig.headerOrder=['zoomToFilteredExtentBtn', 'zoomBtn', 'popoutBtn', 'displayToggle']] List of viewHeader methods to be executed.
@property {array} [viewConfig.headerBtn] Array of elements to be added to the layer.view header.
*/
function viewConfig(layer) {
  // Spread viewConfig into defaults.
  layer.viewConfig = {
    displayToggle: true,
    zoomBtn: true,
    zoomToFilteredExtentBtn: true,
    hideDisabled: false,
    ...layer.viewConfig,
  };

  layer.viewConfig.drawer ??= layer.drawer;

  // layer.zoomBtn is the legacy configuration for layer.viewConfig.zoomBtn
  if (layer.zoomBtn === false) {
    delete layer.viewConfig.zoomBtn;
    delete layer.zoomBtn;
  }

  // layer.popout is the legacy configuration for layer.viewConfig.popoutBtn
  layer.viewConfig.popoutBtn ??= layer.popout;

  // The zoomBtn and hideDisabled is not possible without a tables config.
  if (!layer.tables) {
    delete layer.viewConfig.zoomBtn;
    delete layer.viewConfig.hideDisabled;
  }

  // Assign viewConfig.panelOrder from legacy JSON layer config.
  layer.viewConfig.panelOrder ??= layer.panelOrder;

  // Delete legacy panelOrder config
  delete layer.panelOrder;

  if (!Array.isArray(layer.viewConfig.panelOrder)) {
    // Assign default panelOrder if not a config array.
    layer.viewConfig.panelOrder = [
      'draw-drawer',
      'dataviews-drawer',
      'filter-drawer',
      'style-drawer',
      'meta',
    ];
  }

  // Create content from layer view panels and plugins
  layer.viewConfig.content = Object.keys(layer)
    .map((key) => mapp.ui.layers?.panels?.[key]?.(layer))
    .filter((panel) => typeof panel !== 'undefined');

  if (Array.isArray(layer.viewConfig.panelOrder)) {
    // Sort the content array according to the data-id in the panelOrder array.
    layer.viewConfig.content.sort((a, b) => {
      return layer.viewConfig.panelOrder.findIndex(
        (chk) => chk === a.dataset?.id,
      ) < layer.viewConfig.panelOrder.findIndex((chk) => chk === b.dataset?.id)
        ? 1
        : -1;
    });
  }

  // layer.classList is the legacy configuration for layer.viewConfig.classList
  layer.viewConfig.classList ??= layer.classList || '';

  // Add default class for layer-view drawer.
  layer.viewConfig.classList += ` layer-view `;

  // Add empty class to prevent expanding an empty drawer.
  layer.viewConfig.classList += layer.viewConfig.content.length
    ? ''
    : ' empty ';

  if (!Array.isArray(layer.viewConfig.headerOrder)) {
    // Assign default headerOrder if not a config array.
    // Items which are not defined in the viewConfig will be filtered out.
    layer.viewConfig.headerOrder = [
      'zoomToFilteredExtentBtn',
      'zoomBtn',
      'popoutBtn',
      'displayToggle',
    ].filter((key) => layer.viewConfig[key]);
  }

  layer.viewConfig.headerBtn ??= [];

  for (const method of layer.viewConfig.headerOrder) {
    const el = mapp.ui.layers.viewHeader[method]?.(layer);
    layer.viewConfig.headerBtn.push(el);
  }
}

/**
@function changeEnd

@description
The changeEnd method is assigned to the mapview.Map changeEnd event listener for layer with a tables object.

Layer with a tables object maybe zoom restricted.

The [layer.tableCurrent()]{@link module:/layer/decorate~tableCurrent} method is called to determine whether the layer has a table configured for the current zoom level.

Nested elements will be disabled if a layer can not be displayed.

@param {layer} layer A decorated mapp layer.
@property {HTMLElement} layer.view The layer view element.
*/
function changeEnd(layer) {
  if (!layer.tableCurrent) return;

  // Get array of nested elements excluding the .header element.
  const nestedElements = Array.from(
    layer.view.querySelectorAll(':scope > :not(.header)'),
  );

  // Check whether the layer can be displayed at current zoom.
  if (layer.tableCurrent()) {
    if (layer.viewConfig.hideDisabled) {
      layer.view.classList.remove('display-none');
    }

    // The zoomBtn is hidden if the layer is in range.
    if (layer.zoomBtn instanceof HTMLElement) {
      layer.zoomBtn.style.setProperty('display', 'none');
    }

    layer.view
      .querySelector('[data-id="display-toggle"]')
      ?.classList.remove('disabled');

    // Enable all drawer elements in array.
    nestedElements.forEach((el) => {
      el.disabled = false;
      el.classList.remove('disabled');
    });
  } else if (layer.table || layer.tables) {
    // The zoomBtn is displayed outside if the layer is out of range.
    if (layer.zoomBtn instanceof HTMLElement) {
      layer.zoomBtn.style.removeProperty('display');
    }

    // Collapse drawer and disable layer.view.
    layer.view.classList.remove('expanded');

    const expandedDrawer = layer.view.querySelectorAll('.expanded');

    // Collapse any expanded elements within layer.view drawer.
    [...expandedDrawer].forEach((drawer) =>
      drawer.classList.remove('expanded'),
    );

    layer.view
      .querySelector('[data-id="display-toggle"]')
      ?.classList.add('disabled');

    // Disable all drawer elements in array.
    nestedElements.forEach((el) => {
      el.disabled = true;
      el.classList.add('disabled');
    });

    if (layer.viewConfig.hideDisabled) {
      layer.view.classList.add('display-none');
    }
  }
}
