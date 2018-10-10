import _xyz from '../_xyz.mjs';

export default function() {

  const layer = this;

  // Set layer display to false, hide the loader element and change the toggle icon.
  layer.display = false;
  layer.loader.style.display = 'none';
  layer.toggle.textContent = 'layers_clear';

  // Filter the layer from the layers hook array.
  _xyz.utils.filterHook('layers', layer.key);
  
  // Remove layer.
  if (layer.L) _xyz.map.removeLayer(layer.L);

  // Set the base key of tile layer to null after removing the layer.
  if (layer.base) {
    _xyz.map.removeLayer(layer.base);
    layer.base = null;
  }

  // Check whether other group layers are visible.
  if (layer.group) _xyz.layer_groups[layer.group].chkVisibleLayer();

  // Run layers check to update attribution and send signal that map render has completed.
  _xyz.layersCheck();

}