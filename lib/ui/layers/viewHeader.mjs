export default {
  zoomToFilteredExtentBtn,
  zoomBtn,
  popoutBtn,
  displayToggle,
};

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

  layer.viewConfig.headerBtn.push(zoomToFilteredExtentBtn);
}

function zoomBtn(layer) {
  const zoomBtn = mapp.utils.html.node`<button
    data-id="zoom-to"
    title=${mapp.dictionary.zoom_to}
    class="notranslate material-symbols-outlined"
    onclick=${() => zoomToRange(layer)}>arrows_input`;

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

  layer.viewConfig.headerBtn.push(zoomBtn);
}

function popoutBtn(layer) {
  const popoutBtn = mapp.utils.html.node`<button 
    data-id="popout-btn"
    class="notranslate material-symbols-outlined">open_in_new`;

  layer.viewConfig.headerBtn.push(popoutBtn);
}

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

  layer.viewConfig.headerBtn.push(displayToggle);
}
