import _xyz from '../../../../_xyz.mjs';

export default function () {

  const layer = this;

  if (!layer.display) return;

  // Return from layer get once added to map.
  if (layer.onMap) return;
  layer.onMap = true;

  if (layer.attribution) _xyz.attribution.set(layer.attribution);

  // Augment request with token if proxied through backend.
  // Otherwise requests will be sent directly to the URI and may not pass through the XYZ backend.  
  let uri = layer.URI.indexOf('provider') > 0 ?
    _xyz.host + '/proxy/request?uri=' + layer.URI + '&token=' + _xyz.token :
    layer.URI;

    // Assign the tile layer to the layer L object and add to map.
  layer.L = L.tileLayer(uri, {
    updateWhenIdle: true,
    pane: layer.key
  }).addTo(_xyz.map);

}