/**
### Fullscreen Plugin

Dictionary entries:
- toolbar_fullscreen

@requires /dictionary

@module /plugins/fullscreen
 */

/**
Adds a fullscreen toggle button to the map view.
@function fullscreen
@param {Object} plugin - The plugin configuration object.
@param {Object} mapview - The mapview object.
@param {ol.Map} mapview.Map - The OpenLayers map object.
@param {Object} mapview.layers - The layers object containing map layers.
@returns {void}
*/
export function fullscreen(plugin, mapview) {
  const btnColumn = mapview.mapButton;

  // The btnColumn element only exists in the default mapp view.
  if (!btnColumn) return;

  function toggleFullscreen(e) {
    e.target.classList.toggle('active');
    document.body.classList.toggle('fullscreen');
    mapview.Map.updateSize();
    Object.values(mapview.layers).forEach((layer) => layer.mbMap?.resize());
  }

  const btn = mapp.utils.html.node`
    <button
      data-id="fullscreen"
      class="mobile-display-none"
      title=${mapp.dictionary.toolbar_fullscreen}
      onclick=${toggleFullscreen}>
      <span class="notranslate material-symbols-outlined">left_panel_close`;

  btnColumn.append(btn);
}
