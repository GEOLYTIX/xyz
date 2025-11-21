/**
### /ui/layers/viewHeader

The module exports an object referencing methods to create elements for the layer view header.

This allows for plugins to add custom methods to mapp.ui.layers.viewHeader{} or override existing methods.

@module /ui/layers/viewHeader
*/

export default {
  zoomToFilteredExtentBtn,
  zoomBtn,
  popoutBtn,
  displayToggle,
};

/**
@function zoomToFilteredExtentBtn

@description
The method creates and returns a button element which will call the [layer.zoomToExtent]{@link module:/layer/decorate~zoomToExtent} method.

@param {layer} layer
@property {object} layer.filter The layer filter configuration.
@property {object} filter.current Filter that are currently applied to layer data requests.
@returns {HTMLElement} Button element.
*/
function zoomToFilteredExtentBtn(layer) {
  const btnStyle = Object.keys(layer.filter.current).length
    ? ''
    : 'display: none;';

  const zoomToFilteredExtentBtn = mapp.utils.html.node`<button
    data-id=zoomToFilteredExtentBtn
    title=${mapp.dictionary.layer_zoom_to_extent}
    style=${btnStyle}
    class="notranslate material-symbols-outlined"
    onclick=${async (e) => {
      // disable button if no locations were found.
      e.target.disabled = !(await layer.zoomToExtent());
      layer.show();
    }}>filter_alt`;

  function zoomToFilteredExtentBtn_changeEnd(layer) {
    if (Object.keys(layer.filter.current).length) {
      zoomToFilteredExtentBtn.style.display = 'inline-block';
    } else {
      zoomToFilteredExtentBtn.style.display = 'none';
    }
  }
  layer.changeEndCallbacks.push(zoomToFilteredExtentBtn_changeEnd);

  return zoomToFilteredExtentBtn;
}

/**
@function zoomBtn

@description
The method creates and returns a button element which will call the zoomToRange method.

@param {layer} layer
@returns {HTMLElement} Button element.
*/
function zoomBtn(layer) {
  const zoomBtn = mapp.utils.html.node`<button
    data-id="zoom-to"
    title=${mapp.dictionary.zoom_to}
    class="notranslate material-symbols-outlined"
    onclick=${() => zoomToRange(layer)}>arrows_input`;

  return zoomBtn;
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
@function zoomBtn

@description
The method creates and returns a button element which will popout the layer view into a dialog.

@param {layer} layer
@returns {HTMLElement} Button element.
*/
function popoutBtn(layer) {
  const popoutBtn = mapp.utils.html.node`<button 
    data-id="popout-btn"
    class="notranslate material-symbols-outlined">open_in_new`;

  return popoutBtn;
}

/**
@function displayToggle

@description
The method creates and returns a button element which will toggle the layer display.

@param {layer} layer
@returns {HTMLElement} Button element.
*/
function displayToggle(layer) {
  const btnClass = `notranslate material-symbols-outlined toggle ${
    layer.zoomDisplay || layer.display ? 'toggle-on' : ''
  }`;

  const displayToggle = mapp.utils.html.node`<button
    data-id=display-toggle
    title=${mapp.dictionary.layer_visibility}
    class=${btnClass}
    onclick=${(e) => {
      if (e.target.classList.toggle('toggle-on')) {
        layer.show();
      } else {
        layer.hide();
      }
    }}>`;

  // Add on callback for toggle button.
  layer.showCallbacks.push(() => {
    displayToggle.classList.add('toggle-on');
  });

  // Remove on callback for toggle button.
  layer.hideCallbacks.push(() => {
    !layer.zoomDisplay && displayToggle.classList.remove('toggle-on');
  });

  return displayToggle;
}
