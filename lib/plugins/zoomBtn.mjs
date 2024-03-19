export function zoomBtn(plugin, mapview) {

  const btnColumn = document.getElementById('mapButton');

  // the btnColumn element only exist in the default mapp view.
  if (!btnColumn) return;

  // Add zoomIn button.
  const btnZoomIn = btnColumn.appendChild(mapp.utils.html.node`
    <button
      id="btnZoomIn"
      .disabled=${mapview.Map.getView().getZoom() >= mapview.locale.maxZoom}
      title=${mapp.dictionary.toolbar_zoom_in}
      onclick=${(e) => {
        const z = parseInt(mapview.Map.getView().getZoom() + 1);
        mapview.Map.getView().setZoom(z);
        e.target.disabled = z >= mapview.locale.maxZoom;
      }}><div class="mask-icon add">`)

  // Add zoomOut button.
  const btnZoomOut = btnColumn.appendChild(mapp.utils.html.node`
    <button
      id="btnZoomOut"
      .disabled=${mapview.Map.getView().getZoom() <= mapview.locale.minZoom}
      title=${mapp.dictionary.toolbar_zoom_out}
      onclick=${(e) => {
        const z = parseInt(mapview.Map.getView().getZoom() - 1);
        mapview.Map.getView().setZoom(z);
        e.target.disabled = z <= mapview.locale.minZoom;
      }}><div class="mask-icon remove">`)

  // changeEnd event listener for zoom button
  mapview.Map.getTargetElement()
    .addEventListener('changeEnd', () => {
      const z = mapview.Map.getView().getZoom();
      btnZoomIn.disabled = z >= mapview.locale.maxZoom;
      btnZoomOut.disabled = z <= mapview.locale.minZoom;
    });
}