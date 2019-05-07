import layer_group from './group.mjs';

export default _xyz => {

  return {

    init: init,

  };

  function init(target) {

    _xyz.layers.listview.node = target;

    // Empty the layers list.
    _xyz.layers.listview.node.innerHTML = '';

    // Reset groups.
    _xyz.layers.listview.groups = {};

    // Loop through the layers and add to layers list.
    Object.values(_xyz.layers.list).forEach(layer => {

      // Create the layer view.
      layer.view();

      const displayOrg = layer.display;

      // Set layer display from hook.
      if (Object.keys(_xyz.hooks.current.layers).length) layer.display = !!~_xyz.hooks.current.layers.indexOf(layer.key);

      if (layer.group) {

        // Create new layer group if group does not exist yet.
        if (!_xyz.layers.listview.groups[layer.group]) {
          layer_group(_xyz, layer);

        } else {
          _xyz.layers.listview.groups[layer.group].chkVisibleLayer();
        }

        // Add group meta to group container.
        if (layer.groupmeta) {
          const meta = _xyz.utils.hyperHTML.wire()`<div class="meta">`;
          meta.innerHTML = layer.groupmeta;
          _xyz.layers.listview.groups[layer.group].meta.appendChild(meta);
        }

        // Append the layer drawer to group.
        _xyz.layers.listview.groups[layer.group].container.appendChild(layer.view.drawer);

      } else {

        // Append the layer drawer to listview.
        _xyz.layers.listview.node.appendChild(layer.view.drawer);
      }
             
      // Push the layer into the layers hook array.
      if (layer.display) _xyz.hooks.push('layers', layer.key);

      if (!layer.display) layer.remove();

      if (!displayOrg && layer.display) {
        layer.show();

      } else {

        // This updates whether the layer can be shown at current zoom.
        layer.tableCurrent();
      }

    });

  }

};