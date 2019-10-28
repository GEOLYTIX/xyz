export default (_xyz, layer) => {

  const header = _xyz.utils.wire()`
    <div class="header"><div>${layer.name || layer.key}`;

  // Add symbol to layer header.
  if (layer.format === 'cluster' && layer.style.marker) {
  
    header.appendChild(_xyz.utils.wire()`
      <img title="Default icon"
      style="float: right; cursor: help;"
      src="${_xyz.utils.svg_symbols(layer.style.marker)}">`);
  }

  header.zoomToExtent = _xyz.utils.wire()`
  <button
  title="Zoom to filtered layer extent"
  class="cursor noselect btn_header xyz-icon icons-fullscreen">
  `;

header.appendChild(header.zoomToExtent);

header.zoomToExtent.onclick = e => {
  e.stopPropagation();
  layer.zoomToExtent();
};
   
header.toggleDisplay = _xyz.utils.wire()`
  <button
  title="Toggle visibility"
  class="${'cursor noselect btn_header xyz-toggle icons-toggle ' + (layer.display && 'on')}">`;

  header.appendChild(header.toggleDisplay);

  header.toggleDisplay.onclick = e => {

    e.stopPropagation();
  
    // Toggle layer display property.
    layer.display = !layer.display;

    header.toggleDisplay.classList.toggle('on');
  
    // Show layer.
    if (layer.display) return layer.show();
  
    // Hide layer.
    layer.remove();
  };

  return header;
  
};