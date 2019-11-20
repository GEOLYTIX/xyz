export default _xyz => {

  return {

    init: init,

  };

  function init(params) {

    // Assign the node for the layers listview.
    _xyz.layers.listview.node = params.target;

    // Empty the layers list.
    _xyz.layers.listview.node.innerHTML = '';

    // Reset groups.
    _xyz.layers.listview.groups = {};

    // Loop through the layers and add to layers list.
    Object.values(_xyz.layers.list).forEach(layer => {

      // Create the layer view.
      _xyz.layers.view.create(layer);

      if (!layer.group) {
        _xyz.layers.listview.node.appendChild(layer.view);

        layer.view.style.maxHeight = layer.view.querySelector('.header').offsetHeight + 'px';

        layer.view.querySelectorAll('.panel').forEach(panel => {
          panel.style.maxHeight = panel.querySelector('.header').offsetHeight + 'px'
        });
        return
      }

      // Create new layer group if group does not exist yet.
      if (!_xyz.layers.listview.groups[layer.group]) createGroup(layer);

      // Add layer to group.
      _xyz.layers.listview.groups[layer.group].addLayer(layer);
    
    });

  }


  function createGroup (layer){

    // Create group object.
    const group = {
      list: []
    };

    // Assign layer group to listview object.
    _xyz.layers.listview.groups[layer.group] = group;

    // Create layer group node and append to listview node.
    const drawer = _xyz.utils.wire()`
    <div class="drawer layer-group expandable">`;

    _xyz.layers.listview.node.appendChild(drawer);

    // Create layer group header.
    const header = _xyz.utils.wire()`
    <div
      class="header enabled"
      onclick=${e=>{
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent(e.target, true);
      }}>
      <span>${layer.group}`;

    drawer.appendChild(header);

    // Create layer group meta element.
    const meta = _xyz.utils.wire()`<div class="meta">`;
    drawer.appendChild(meta);

    // Check whether some layers group are visible and toggle visible button display accordingly.
    group.chkVisibleLayer = () => {

      if (group.list.some(layer => layer.display)) {
        hideLayers.classList.add('on');
        hideLayers.disabled = false;
      } else {
        hideLayers.classList.remove('on');
        hideLayers.disabled = true;
      }
    };

    group.addLayer = layer => {

      if (layer.groupmeta) {
        const groupmeta = _xyz.utils.wire()`<div>`;
        groupmeta.innerHTML = layer.groupmeta;
        meta.appendChild(groupmeta);
      }

      group.list.push(layer);
      drawer.appendChild(layer.view);
      layer.view.style.maxHeight = layer.view.querySelector('.header').offsetHeight + 'px';

      layer.view.querySelectorAll('.panel').forEach(panel => {
        panel.style.maxHeight = panel.querySelector('.header').offsetHeight + 'px'
      });

      group.chkVisibleLayer();
    }

    // Create hide all group layers button.
    const hideLayers = _xyz.utils.wire()`
    <button
      class="btn-header xyz-icon icon-toggle"
      title="Hide layers from group"
      onclick=${e=>{
        e.stopPropagation();
        group.list
          .filter(layer => layer.display)
          .forEach(layer => layer.remove())

      }}>`;

    header.appendChild(hideLayers);

    // Create group expander button.
    header.appendChild(_xyz.utils.wire()`
    <button 
      class="xyz-icon btn-header icon-expander"
      title="Toggle group panel"
      onclick=${ e => {
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent(e.target);
      }}>`);

    drawer.style.maxHeight = header.offsetHeight + 'px';

  }

};