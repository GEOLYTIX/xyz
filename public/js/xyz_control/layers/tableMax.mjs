export default _xyz => function () {

  const layer = this;

  if (!layer.tables) return layer.table;

  let zoomKeys = Object.keys(layer.tables);

  return layer.tables[zoomKeys[zoomKeys.length-1]] || layer.tables[zoomKeys[zoomKeys.length-2]];
    
};