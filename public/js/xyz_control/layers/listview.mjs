export default _xyz => {

  return {

    init: init,

  };

  function init(params) {

    _xyz.layers.listview.node = params.target;

    // Empty the layers list.
    _xyz.layers.listview.node.innerHTML = '';

    // Reset groups.
    _xyz.layers.listview.groups = {};

    // Loop through the layers and add to layers list.
    Object.values(_xyz.layers.list).forEach(layer => {

      // Create the layer view.
      //layer.view = _xyz.layers.view(layer);
      _xyz.layers.view(layer);

      if (layer.group) {

        // Create new layer group if group does not exist yet.
        if (!_xyz.layers.listview.groups[layer.group]) {
          createGroup(layer);

        } else {
          _xyz.layers.listview.groups[layer.group].chkVisibleLayer();
        }

        // Add group meta to group container.
        if (layer.groupmeta) {
          _xyz.layers.listview.groups[layer.group].meta.appendChild(_xyz.utils.wire()`<div class="meta">${layer.groupmeta}`);
        }

        // Append the layer to the listview group.
        _xyz.layers.listview.groups[layer.group].container.appendChild(layer.view.drawer);

      } else {

        // Append the layer to the listview root.
        _xyz.layers.listview.node.appendChild(layer.view.drawer);
      }

      // Show layer, if display is true.
      if (layer.display) layer.show();

    });

  }


  function createGroup (layer){

    // Create group object.
    const group = {};

    // Create new layer group.
    _xyz.layers.listview.groups[layer.group] = group;


    // Create layer group container.
    group.container = _xyz.utils.wire()`<div class="drawer drawer-group expandable-group">`;

    _xyz.layers.listview.node.appendChild(group.container);


    // Create layer group header.
    group.header = _xyz.utils.wire()`<div class="header-group"><div>${layer.group}`;
    
    group.header.onclick = e => {
      e.stopPropagation();
      _xyz.utils.toggleExpanderParent({
        expandable: e.target.parentNode,
        expandedTag: 'expanded-group',
        expandableTag: 'expandable-group',
        accordeon: true,
      });
    };

    group.container.appendChild(group.header);


    // Create group meta container
    group.meta = _xyz.utils.wire()`<div>`;
    group.container.appendChild(group.meta);


    // Check whether some layers group are visible and toggle visible button display accordingly.
    group.chkVisibleLayer = () => {

      let someVisible = Object.values(_xyz.layers.list).some(_layer => (_layer.display && _layer.group === layer.group));

      group.visible.style.display = someVisible ? 'block' : 'none';
    };


    // Create hide all group layers button.
    group.visible = _xyz.utils.wire()`
    <i class="material-icons cursor noselect btn_header hide-group"
    title="Hide layers from group">edit_attributes`;
   
    group.visible.onclick = e => {
      e.stopPropagation();

      // Iterate through all layers and remove layer if layer is in group.
      Object.values(_xyz.layers.list).forEach(_layer => {
        if (_layer.group === layer.group && _layer.display) _layer.remove();
      });
    };

    group.header.appendChild(group.visible);


    // Create group expander button.
    const expander = _xyz.utils.wire()`
    <i class="material-icons cursor noselect btn_header expander-group"
    title="Toggle group panel">`;

    expander.onclick = e => {
      e.stopPropagation();
      _xyz.utils.toggleExpanderParent({
        expandable: group.container,
        expandedTag: 'expanded-group',
        expandableTag: 'expandable-group',
      });
    };

    group.header.appendChild(expander);
  }

};