export default _xyz => params => {

  if (!params.json) return;
  
  return _xyz.mapview.lib.geoJson(params.json, {
    interactive: params.interactive || false,
    pane: params.pane || 'default',
    pointToLayer: (feature, latlng) => new _xyz.mapview.lib.Marker(latlng, {
      interactive: params.interactive || false,
      pane: params.pane || 'default',
      icon: _xyz.mapview.lib.icon({
        iconUrl: params.style.icon.url,
        iconSize: params.style.icon.size,
        iconAnchor: params.style.icon.anchor
      })
    }),
    style: params.style || {}
  }).addTo(_xyz.map);
  
};