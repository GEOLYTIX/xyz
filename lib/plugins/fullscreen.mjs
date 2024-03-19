export function fullscreen(plugin, mapview) {

  const btnColumn = document.getElementById('mapButton');

  // the btnColumn element only exist in the default mapp view.
  if (!btnColumn) return;

  function toggleFullscreen(e) {

    e.target.classList.toggle('active');
    document.body.classList.toggle('fullscreen');
    mapview.Map.updateSize();
    Object.values(mapview.layers)
      .forEach((layer) => layer.mbMap?.resize());
  }

  const btn = mapp.utils.html.node`
    <button
      class="mobile-display-none"
      title=${mapp.dictionary.toolbar_fullscreen}
      onclick=${toggleFullscreen}>
      <div class="mask-icon map">`

  btnColumn.append(btn)
}