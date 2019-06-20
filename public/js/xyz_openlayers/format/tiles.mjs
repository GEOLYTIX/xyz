export default _xyz => layer => () => {

  if (!layer.display) return ;//layer.remove();

  // Return from layer get once added to map.
  if (layer.loaded) return;
  layer.loaded = true;

  // Augment request with token if proxied through backend.
  // Otherwise requests will be sent directly to the URI and may not pass through the XYZ backend.  
  const uri = layer.URI.indexOf('provider') > 0 ?
    _xyz.host + '/proxy/request?' + _xyz.utils.paramString({
      uri: layer.URI,
      token: _xyz.token
    }) :
    layer.URI;

    
  layer.L = new _xyz.mapview.lib.ol.layer.Tile({
    source: new _xyz.mapview.lib.ol.source.OSM({
      url: 'https://cartodb-basemaps-{a-d}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png'
    })
  });

  _xyz.map.addLayer(layer.L);
 
  // _xyz.map.on('rendercomplete', () => {
  //   if (layer.loader)  layer.loader.style.display = 'none';
  // });

};