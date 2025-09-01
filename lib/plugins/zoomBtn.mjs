/**
### Zoom Btn Plugin

Dictionary entries:
- toolbar_zoom_in
- toolbar_zoom_out

@requires /dictionary

@module /plugins/zoomBtn
*/

/**
@function zoomBtn

@description
Adds zoom in and zoom out buttons to the mapview.

@param {Object} plugin The plugin configuration object.
@param {Object} mapview The mapview object.
@property {ol.Map} mapview.Map The OpenLayers map object.
@property {Object} mapview.locale The locale object of the mapview.
@property {number} locale.maxZoom The maximum zoom level allowed.
@property {number} locale.minZoom The minimum zoom level allowed.
*/
export function zoomBtn(plugin, mapview) {
  // Plugin will err if called from layer.
  if (!mapview) return;

  const btnColumn = mapview.mapButton;

  // the btnColumn element only exist in the default mapp view.
  if (!btnColumn) return;

  // Add zoomIn button.
  const btnZoomIn = btnColumn.appendChild(mapp.utils.html.node`
    <button
      data-id="btnZoomIn"
      .disabled=${mapview.Map.getView().getZoom() >= mapview.locale.maxZoom}
      title=${mapp.dictionary.toolbar_zoom_in}
      onclick=${(e) => {
        const z = parseInt(mapview.Map.getView().getZoom() + 1);
        mapview.Map.getView().setZoom(z);
        e.target.disabled = z >= mapview.locale.maxZoom;
      }}><span class="notranslate material-symbols-outlined">zoom_in`);

  // Add zoomOut button.
  const btnZoomOut = btnColumn.appendChild(mapp.utils.html.node`
    <button
      data-id="btnZoomOut"
      .disabled=${mapview.Map.getView().getZoom() <= mapview.locale.minZoom}
      title=${mapp.dictionary.toolbar_zoom_out}
      onclick=${(e) => {
        const z = parseInt(mapview.Map.getView().getZoom() - 1);
        mapview.Map.getView().setZoom(z);
        e.target.disabled = z <= mapview.locale.minZoom;
      }}><span class="notranslate material-symbols-outlined">zoom_out`);

  // changeEnd event listener for zoom button
  mapview.Map.getTargetElement().addEventListener('changeEnd', () => {
    const z = mapview.Map.getView().getZoom();
    btnZoomIn.disabled = z >= mapview.locale.maxZoom;
    btnZoomOut.disabled = z <= mapview.locale.minZoom;
  });
}
