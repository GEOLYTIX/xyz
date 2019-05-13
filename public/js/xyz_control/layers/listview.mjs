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


    // Set layer display from hook.
    if (_xyz.hooks && _xyz.hooks.current && _xyz.hooks.current.layers.length > 0) {
      Object.values(_xyz.layers.list).forEach(layer => {
        layer.display = !!~_xyz.hooks.current.layers.indexOf(layer.key);
      });
    }


    // Loop through the layers and add to layers list.
    Object.values(_xyz.layers.list).forEach(layer => {

      // Create the layer view.
      layer.view();

      if (layer.group) {

        // Create new layer group if group does not exist yet.
        if (!_xyz.layers.listview.groups[layer.group]) {
          createGroup(layer);

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

      if (layer.display) {
        layer.show();
      }

      if (!layer.display) {
        layer.remove();
        layer.tableCurrent();
      }

    });

  }


  function createGroup (layer){

    // Create group object.
    const group = {};

    // Create new layer group.
    _xyz.layers.listview.groups[layer.group] = group;


    // Create layer group container.
    group.container = _xyz.utils.hyperHTML.wire()`<div class="drawer drawer-group expandable-group">`;

    _xyz.layers.listview.node.appendChild(group.container);


    // Create layer group header.
    group.header = _xyz.utils.hyperHTML.wire()`<div class="header-group">${layer.group}`;

    group.container.appendChild(group.header);

    group.header.onclick = e => {
      e.stopPropagation();
      _xyz.utils.toggleExpanderParent({
        expandable: e.target.parentNode,
        expandedTag: 'expanded-group',
        expandableTag: 'expandable-group',
        accordeon: true,
        scrolly: _xyz.desktop && _xyz.desktop.listviews,
      });
    };


    // Create group meta container
    group.meta = _xyz.utils.hyperHTML.wire()`<div>`;
    group.container.appendChild(group.meta);


    // Check whether some layers group are visible and toggle visible button display accordingly.
    group.chkVisibleLayer = () => {
      let someVisible = Object.values(_xyz.layers.list)
        .some(_layer => (_layer.group === layer.group && _layer.display));

      group.visible.style.display = someVisible ? 'block' : 'none';
    };


    // Create hide all group layers button.
    group.visible = _xyz.utils.hyperHTML.wire()`
    <i class="material-icons cursor noselect btn_header hide-group"
    title="Hide layers from group">
    visibility`;

    group.header.appendChild(group.visible);

    group.visible.onclick = e => {
      e.stopPropagation();

      // Iterate through all layers and remove layer if layer is in group.
      Object.values(_xyz.layers.list).forEach(_layer => {
        if (_layer.group === layer.group && _layer.display) _layer.remove();
      });
    };


    // Create group expander button.
    const expander = _xyz.utils.hyperHTML.wire()`
    <i class="material-icons cursor noselect btn_header expander-group"
    title="Toggle group panel">`;

    group.header.appendChild(expander);

    expander.onclick = e => {
      e.stopPropagation();
      _xyz.utils.toggleExpanderParent({
        expandable: group.container,
        expandedTag: 'expanded-group',
        expandableTag: 'expandable-group',
        scrolly: _xyz.desktop && _xyz.desktop.listviews,
      });
    };
  }

};