export default layer => {

  const gazetteer = mapp.utils.html.node`
  <div class="dropdown active">
    <input id="gazetteerInput" type="text" placeholder=${layer.gazetteer.placeholder || 'Search'}>
    <ul></ul>`

  mapp.ui.Gazetteer(Object.assign({
    mapview: layer.mapview,
    target: gazetteer,
    layer: layer.key
  }, layer.gazetteer));
  
  return gazetteer
}