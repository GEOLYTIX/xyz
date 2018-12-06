import _xyz from '../_xyz.mjs';

export default function() {

  const layer = this;

  // Set layer display to false, hide the loader element and change the toggle icon.
  layer.display = false;
  layer.loader.style.display = 'none';
  layer.toggle.textContent = 'layers_clear';

  // Filter the layer from the layers hook array.
  _xyz.hooks.filter('layers', layer.key);

  // Remove layer.
  if (layer.L) _xyz.map.removeLayer(layer.L);

  // Check whether other group layers are visible.
  if (layer.group) _xyz.layers.groups[layer.group].chkVisibleLayer();

  // Run layers check to update attribution and send signal that map render has completed.
  //_xyz.layers.check();

}