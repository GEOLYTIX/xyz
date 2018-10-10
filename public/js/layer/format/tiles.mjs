import _xyz from '../../_xyz.mjs';

import L from 'leaflet';

export default function(){

  const layer = this;

  if (layer.display) {

    layer.loader.style.display = 'block';

    let uri = layer.provider ?
      _xyz.host + '/proxy/image?uri=' + layer.URI + '&provider=' + layer.provider + '&token=' + _xyz.token :
      layer.URI;

    layer.base = L.tileLayer(uri, {
      pane: layer.key,
      updateWhenIdle: true
    })
      .addTo(_xyz.map)
      .on('loading', () => {
        layer.loader.style.display = 'block';
      })
      .on('load', () => {
        layer.loader.style.display = 'none';
        //layersCheck();
      });
  }
}