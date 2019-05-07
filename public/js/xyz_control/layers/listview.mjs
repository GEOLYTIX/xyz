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

    const layer_hooks = Object.keys(_xyz.hooks.current.layers).length > 0;

    // Loop through the layers and add to layers list.
    Object.values(_xyz.layers.list).forEach(layer => {

      layer.view();

      const displayOrg = layer.display;

      if (layer_hooks)  layer.display = !!~_xyz.hooks.current.layers.indexOf(layer.key);
      
      // Create new layer group if group does not exist yet.
      if (layer.group && !_xyz.layers.listview.groups[layer.group]) layer_group(_xyz, layer);

      if (layer.group && _xyz.layers.listview.groups[layer.group]) _xyz.layers.listview.groups[layer.group].chkVisibleLayer();

      if (layer.group && layer.groupmeta) {
        const meta = _xyz.utils.hyperHTML.wire()`<div class="meta">`;
        meta.innerHTML = layer.groupmeta;
        _xyz.layers.listview.groups[layer.group].meta.appendChild(meta);
      }


      layer.group ? 
        _xyz.layers.listview.groups[layer.group].container.appendChild(layer.view.drawer) :
        _xyz.layers.listview.node.appendChild(layer.view.drawer);


      // Push the layer into the layers hook array.
      if (layer.display) _xyz.hooks.push('layers', layer.key);

      if (!layer.display) layer.remove();

      if (!displayOrg && layer.display) {
        layer.show();
      } else {
        layer.tableCurrent();
      }

      if (_xyz.log) console.log(layer);

    });

  }

};