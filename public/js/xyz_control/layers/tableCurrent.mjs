export default _xyz => function () {

  const layer = this;

  if (!layer.tables) return layer.table;

  let
    table,
    zoom = _xyz.map.getZoom(),
    zoomKeys = Object.keys(layer.tables),
    minZoomKey = parseInt(zoomKeys[0]),
    maxZoomKey = parseInt(zoomKeys[zoomKeys.length - 1]);
            
  table = layer.tables[zoom];

  table = zoom < minZoomKey ? layer.tables[minZoomKey] : table;

  table = zoom > maxZoomKey ? layer.tables[maxZoomKey] : table;

  if (layer.view.drawer) layer.view.drawer.style.opacity = !table ? 0.4 : 1;

  if (layer.view.loader && !table) layer.view.loader.style.display = 'none';

  return table;
      
};