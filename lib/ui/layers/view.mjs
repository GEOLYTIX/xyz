/**
### /ui/layers/view

The module exports a method to create layer.view elements.

@module /ui/layers/view
*/

mapp.utils.merge(mapp.dictionaries, {
  en: {
    layer_zoom_to_extent: 'Zoom to filtered layer extent',
    layer_visibility: 'Toggle visibility',
    zoom_to: 'Zoom to',
  },
  de: {
    layer_zoom_to_extent: 'Zoom zum Ausmaß des gefilterten Datensatzes',
    layer_visibility: 'Umschalten der Ansicht',
    zoom_to: 'Heranzoomen',
  },
  zh: {
    layer_zoom_to_extent: '缩放至筛选图层的相应范围',
    layer_visibility: '可见性切换',
    zoom_to: '缩放至',
  },
  zh_tw: {
    layer_zoom_to_extent: '縮放至篩選圖層的相應範圍',
    layer_visibility: '可見性切換',
    zoom_to: '縮放至',
  },
  pl: {
    layer_zoom_to_extent: 'Przybliż do odfiltrowanej wastwy',
    layer_visibility: 'Zmodyfikuj widzialność',
    zoom_to: 'Przybliż do',
  },
  fr: {
    layer_zoom_to_extent: 'Zoom sur la couche filtrée',
    layer_visibility: 'Modifier la visibilité',
    zoom_to: 'Zoom sur',
  },
  ja: {
    layer_zoom_to_extent: 'フィルターされたレイヤー範囲をズームに',
    layer_visibility: '表示切替',
    zoom_to: 'ズームへ',
  },
  esp: {
    layer_zoom_to_extent: 'Zoom a capa filtrada',
    layer_visibility: 'Alternar visibilidad',
    zoom_to: 'Acercar a',
  },
  tr: {
    layer_zoom_to_extent: 'Filtrelenmis katman kapsamina yaklas',
    layer_visibility: 'Gorunurlugu degistir',
    zoom_to: 'Yaklas',
  },
  it: {
    layer_zoom_to_extent: 'Zoom sul layer',
    layer_visibility: 'Attiva/Disattiva visibilità',
    zoom_to: 'Zoom a',
  },
  th: {
    layer_zoom_to_extent: 'ซูมไปที่ขอบเขตเลเยอร์ที่กรอง',
    layer_visibility: 'สลับการมองเห็น',
    zoom_to: 'ซูมไปที่',
  },
})

/**
@function layerView

@description
The layerView method will create and assign a layer.view node to the layer object.

@param {layer} layer A decorated mapp layer.
@property {Object} layer.view No layer view will be created with the view property null.
@property {Object} layer.drawer The layer view will not be in a drawer element with the drawer property null.

@returns {layer} The layer object is returned after the layer view has been created.
*/
export default function layerView(layer) {
  // Do not create a layer view.
  if (layer.view === null) return layer;

  layer.view = mapp.utils.html.node`<div 
    data-id=${layer.key}
    class="layer-view">`;

  viewConfig(layer);

  // Don't create a drawer element layer view.
  if (layer.drawer === null) {
    // Append elements directly to layer.view
    layer.viewConfig.content.forEach((el) => layer.view.append(el));

    return layer;
  }

  layer.zoomToFilteredExtentBtn =
    layer.viewConfig.zoomToFilteredExtentBtn &&
    mapp.utils.html.node`<button
      data-id=zoomToFilteredExtentBtn
      title=${mapp.dictionary.layer_zoom_to_extent}
      class="mask-icon filter"
      onclick=${async (e) => {
        // disable button if no locations were found.
        e.target.disabled = !(await layer.zoomToExtent());

        layer.show();
      }}>`;

  // The displayToggle element should be on if the layer is displayed or should be displayed in zoom range.
  const displayToggleClass = `mask-icon toggle ${
    layer.zoomDisplay || layer.display ? 'on' : ''
  }`;

  // Create layer.displayToggle button for header.
  layer.displayToggle =
    layer.viewConfig.displayToggle &&
    mapp.utils.html.node`<button
      data-id=display-toggle
      title=${mapp.dictionary.layer_visibility}
      class=${displayToggleClass}
      onclick=${(e) => {
        const toggle = e.target.classList.toggle('on');
        toggle ? layer.show() : layer.hide();
      }}>`;

  // Create a div for the magnifying glass icon
  layer.zoomBtn =
    layer.viewConfig.zoomBtn &&
    mapp.utils.html.node`<button 
      data-id="zoom-to"
      title=${mapp.dictionary.zoom_to}
      class="mask-icon search"
      onclick=${() => zoomToRange(layer)}>`;

  // Add on callback for toggle button.
  layer.showCallbacks.push(() => {
    layer.displayToggle.classList.add('on');
  });

  // Remove on callback for toggle button.
  layer.hideCallbacks.push(() => {
    !layer.zoomDisplay && layer.displayToggle.classList.remove('on');
  });

  const header = mapp.utils.html`
    <h2>${layer.name || layer.key}</h2>
      ${layer.zoomToFilteredExtentBtn || ''}
      ${layer.zoomBtn || ''}
      ${layer.displayToggle || ''}
      <div class="mask-icon expander"></div>`;

  layer.drawer = mapp.ui.elements.drawer({
    data_id: layer.key,
    class: layer.viewConfig.classList,
    header,
    content: layer.viewConfig.content,
  });

  // Render layer.drawer into layer.view
  mapp.utils.render(layer.view, layer.drawer);

  // Filter Function
  filterFunction(layer); 

  // The layer may be zoom level restricted.
  layer.tables &&
    layer.mapview.Map.getTargetElement().addEventListener('changeEnd', () =>
      changeEnd(layer)
    );

  return layer;
}

/**
@function viewConfig

@description
The viewConfig method will create viewConfig object and update the configuration from legacy properties.

The method will iterate through the panelOrder keys to add panel to the content array. 

@param {layer} layer A decorated mapp layer.
@property {Object} [layer.viewConfig] Control options for elements in the layer.view.
@property {Boolean} [viewConfig.displayToggle=true] Controls whether the layer toggle close is displayed.
@property {Boolean} [viewConfig.zoomBtn=true] Controls whether the zoom magnifying glass is displayed.
@property {Boolean} [layer.zoomBtn] Legacy property for viewConfig.zoomBtn.
@property {Array} [layer.tables] Array of data tables for different zoom level.
@property {Boolean} [viewConfig.zoomToFilteredExtentBtn=true] Controls whether the zoom to extent button is displayed.
@property {Array} [viewConfig.panelOrder=['draw-drawer', 'dataviews-drawer', 'filter-drawer', 'style-drawer', 'meta']] Controls which panels are added to the view and in which order, will be assigned from layer.panelOrder if not explicit.
@property {Array} [layer.panelOrder] Legacy configuration for viewConfig.panelOrder.
@property {string} [viewConfig.classList] Classlist string to be added to layer-view drawer element classList.
@property {string} [layer.classList] Legacy property for viewConfig.classList.
*/
function viewConfig(layer) {
  layer.viewConfig ??= {
    displayToggle: true,
    zoomBtn: true,
    zoomToFilteredExtentBtn: true,
  };


  // The zoomBtn should not be created.
  if (layer.zoomBtn === false) {
    delete layer.viewConfig.zoomBtn;
    delete layer.zoomBtn;
  }

  // The zoomBtn is not possible without a tables config.
  if (!layer.tables) {
    delete layer.viewConfig.zoomBtn;
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
    .map(
      (key) => mapp.ui.layers?.panels?.[key]?.(layer)
    )
    .filter((panel) => typeof panel !== 'undefined');

  if (Array.isArray(layer.viewConfig.panelOrder)) {
    // Sort the content array according to the data-id in the panelOrder array.
    layer.viewConfig.content.sort((a, b) => {
      return layer.viewConfig.panelOrder.findIndex(
        (chk) => chk === a.dataset?.id
      ) < layer.viewConfig.panelOrder.findIndex((chk) => chk === b.dataset?.id)
        ? 1
        : -1;
    });
  }

  layer.viewConfig.classList ??= '';

  // Add default class for layer-view drawer.
  layer.viewConfig.classList += ` layer-view raised `;

  // Add legacy config for layer-view classList.
  layer.viewConfig.classList += layer.classList || '';

  // Add empty class to prevent expanding an empty drawer.
  layer.viewConfig.classList += layer.viewConfig.content.length
    ? ''
    : ' empty ';
}

/**
@function zoomToRange

@description
The zoomToRange method set layer.mapview zoom to be in range of the layer.tables configuration and calls the [layer.show()]{@link module:/layer/decorate~show} method.

@param {layer} layer A decorated mapp layer.
@property {Object} layer.tables The zoom range table configuration.
*/
function zoomToRange(layer) {
  const minZoom = Object.entries(layer.tables).find((entry) => !!entry[1])[0];

  const maxZoom = Object.entries(layer.tables)
    .reverse()
    .find((entry) => !!entry[1])[0];

  const view = layer.mapview.Map.getView();

  view.getZoom() < minZoom ? view.setZoom(minZoom) : view.setZoom(maxZoom);

  layer.show();
}

/**
@function filterFunction

@description
The filterFunction method will set the display property of the layer.zoomToFilteredExtentBtn element to block if the layer.filter.current object is not empty.
@param {layer} layer A decorated mapp layer.
*/
function filterFunction(layer) {

  if (Object.keys(layer.filter.current).length > 0) {

    layer.zoomToFilteredExtentBtn instanceof HTMLElement &&
      layer.zoomToFilteredExtentBtn.style.setProperty('visibility', 'visible');
  }
  else {

    layer.zoomToFilteredExtentBtn instanceof HTMLElement &&
      layer.zoomToFilteredExtentBtn.style.setProperty('visibility', 'hidden');
  }
}

/**
@function changeEnd

@description
The changeEnd method is assigned to the mapview.Map changeEnd event listener for layer with a tables object.

Layer with a tables object maybe zoom restricted.

The [layer.tableCurrent()]{@link module:/layer/decorate~tableCurrent} method is called to determine whether the layer has a table configured for the current zoom level.

@param {layer} layer A decorated mapp layer.
@property {HTMLElement} layer.view The layer view element.
@property {HTMLElement} layer.displayToggle A button element which toggles the layer.display.
@property {HTMLElement} layer.zoomBtn A button element which sets the mapview into the visible zoom range for the layer.
*/
function changeEnd(layer) {
  // Get array of drawer in layer.drawer
  const drawerArray = Array.from(
    layer.drawer.querySelectorAll(':scope > .drawer')
  );

  if (layer.tableCurrent()) {
    // The zoomBtn is hidden if the layer is in range.
    layer.zoomBtn instanceof HTMLElement &&
      layer.zoomBtn.style.setProperty('visiblity', 'hidden');

    // Enable layer display toggle.
    layer.displayToggle instanceof HTMLElement &&
      layer.displayToggle.classList.remove('disabled');

    // Enable all drawer elements in array.
    drawerArray.forEach((el) => el.classList.remove('disabled'));
  } else {
    // The zoomBtn is displayed outside if the layer is out of range.
    layer.zoomBtn instanceof HTMLElement &&
      layer.zoomBtn.style.setProperty('visiblity', 'visible');

    // Collapse drawer and disable layer.view.
    layer.view.querySelector('.layer-view.drawer').classList.remove('expanded');

    // Disable layer display toggle.
    layer.displayToggle instanceof HTMLElement &&
      layer.displayToggle.classList.add('disabled');

    // Disable all drawer elements in array.
    drawerArray.forEach((el) => el.classList.add('disabled'));
  }
}
