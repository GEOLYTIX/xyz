import _xyz from '../_xyz.mjs';

export default group => {

  // Create new layer group.
  _xyz.layer_groups[group] = {
    group: group
  };

  // Create layer group container.
  _xyz.layer_groups[group].container = _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'drawer drawer-group expandable-group'
    },
    appendTo: document.getElementById('layers')
  });
  
  // Create layer group header.
  _xyz.layer_groups[group].header = _xyz.utils.createElement({
    tag: 'div',
    options: {
      textContent: group,
      className: 'header-group'
    },
    appendTo: _xyz.layer_groups[group].container,
    eventListener: {
      event: 'click',
      funct: e => {
        _xyz.utils.toggleExpanderParent({
          expandable: e.target.parentNode,
          expandedTag: 'expanded-group',
          expandableTag: 'expandable-group',
          accordeon: true,
          scrolly: document.querySelector('.mod_container > .scrolly')
        });
      }
    }
  });

  // Function to check whether layers in group are visible.
  _xyz.layer_groups[group].chkVisibleLayer = group => {
    return Object.values(_xyz.layers).some(layer => (layer.group === group && layer.display));
  };

  // Create hide all group layers button.
  _xyz.layer_groups[group].hideAll = _xyz.utils.createElement({
    tag: 'i',
    options: {
      className: 'material-icons cursor noselect btn_header hide-group',
      title: 'Hide layers from group',
      textContent: 'visibility'
    },
    appendTo: _xyz.layer_groups[group].header,
    style: {
      display: (_xyz.layer_groups[group].chkVisibleLayer(group) ? 'block' : 'none')
    },
    eventListener: {
      event: 'click',
      funct: e => {
        e.stopPropagation();
        e.target.style.display = 'none';
    
        // Iterate through all layers and remove layer if layer is in group.
        Object.values(layers).forEach(layer => {
          if (layer.group === group && layer.display) layer.removeLayer(layer);
        });
    
        _xyz.layersCheck();
      }
    }
  });

  // Create group expander button.
  _xyz.utils.createElement({
    tag: 'i',
    options: {
      className: 'material-icons cursor noselect btn_header expander-group',
      title: 'Toggle group panel'
    },
    appendTo: _xyz.layer_groups[group].header,
    eventListener: {
      event: 'click',
      funct: e => {
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent({
          expandable: _xyz.layer_groups[group].container,
          expandedTag: 'expanded-group',
          expandableTag: 'expandable-group',
          scrolly: document.querySelector('.mod_container > .scrolly')
        });
      }
    }
  });

};