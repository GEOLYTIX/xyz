export default _xyz => params => {

  if (!params.json) return;
  
  return _xyz.L.geoJson(params.json, {
    interactive: params.interactive || false,
    pane: params.pane || 'default',
    pointToLayer: (feature, latlng) => new _xyz.L.Marker(latlng, {
      interactive: params.interactive || false,
      pane: params.pane || 'default',
      icon: _xyz.L.icon({
        iconUrl: params.style.icon.url,
        iconSize: params.style.icon.size,
        iconAnchor: params.style.icon.anchor
      })
    }),
    style: params.style || {}
  }).addTo(_xyz.map);
  
};