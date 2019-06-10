export default _xyz => function () {

  const layer = this;

  if (!layer.tables) return layer.table;

  let zoomKeys = Object.keys(layer.tables);

  return layer.tables[zoomKeys[0]] || layer.tables[zoomKeys[1]];
  
};