export default _xyz => params => {

  if (!params.json) return;

  if (!params.icon) return _xyz.L.geoJson(params.json, {
    interactive: params.interactive || false,
    pane: params.pane || 'default',
    style: params.style || {}
  }).addTo(_xyz.map);

  return _xyz.L.geoJson(params.json, {
    interactive: params.interactive || false,
    pane: params.pane || 'default',
    pointToLayer: (feature, latlng) => new _xyz.L.Marker(latlng, {
      interactive: params.interactive || false,
      pane: params.pane || 'default',
      icon: _xyz.L.icon({
        iconUrl: params.icon.url,
        iconSize: params.icon.size || 40,
        iconAnchor: params.icon.anchor || [20, 40]
      })
    }),
    style: params.style || {}
  }).addTo(_xyz.map);

};