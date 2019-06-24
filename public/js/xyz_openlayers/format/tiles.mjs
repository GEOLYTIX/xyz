export default _xyz => layer => () => {

  if (!layer.display) return ;//layer.remove();

  // Return from layer get once added to map.
  if (layer.loaded) return;

  layer.loaded = true;

  if (layer.L) return;

  // Augment request with token if proxied through backend.
  // Otherwise requests will be sent directly to the URI and may not pass through the XYZ backend.  
  const uri = layer.URI.indexOf('provider') > 0 ?
    _xyz.host + '/proxy/request?' + _xyz.utils.paramString({
      uri: layer.URI,
      token: _xyz.token
    }) :
    layer.URI;


  //const uri = _xyz.host + '/proxy/request?uri=' + layer.URI;

    
  layer.L = new _xyz.mapview.lib.ol.layer.Tile({
    source: new _xyz.mapview.lib.ol.source.OSM({
      url: decodeURIComponent(uri),
      //url: 'https://cartodb-basemaps-{a-d}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png',
      //url: 'https://api.mapbox.com/styles/v1/dbauszus/ciozrimi3002bdsm8bjtn2v1y/tiles/256/{z}/{x}/{y}?&access_token=pk.eyJ1IjoiZGJhdXN6dXMiLCJhIjoiY2pnZGsyaDhwMmpjaDMzbnBiNzJiaHR5NyJ9.C6zuLjG4Q3dmflE-LQZY4g',
      transition: 0,
    })
  });

  _xyz.map.addLayer(layer.L);
 
  _xyz.map.on('rendercomplete', () => {
    console.log('tiles rendercomplete');
    if (layer.loader)  layer.loader.style.display = 'none';
  });

};