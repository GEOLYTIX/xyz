import _xyz from '../_xyz.mjs';

export default groupKey => {

  // Create group object.
  const group = {};

  // Create new layer group.
  _xyz.layer_groups[groupKey] = group;

  // Create layer group container.
  group.container = _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'drawer drawer-group expandable-group'
    },
    appendTo: document.getElementById('layers')
  });
  
  // Create layer group header.
  group.header = _xyz.utils.createElement({
    tag: 'div',
    options: {
      textContent: groupKey,
      className: 'header-group'
    },
    appendTo: group.container,
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

  // Check whether some layers group are visible and toggle visible button display accordingly.
  group.chkVisibleLayer = () => {
    let someVisible = Object.values(_xyz.layers)
      .some(layer => (layer.group === groupKey && layer.display));
    
    group.visible.style.display = someVisible ? 'block' : 'none';
  };

  // Create hide all group layers button.
  group.visible = _xyz.utils.createElement({
    tag: 'i',
    options: {
      className: 'material-icons cursor noselect btn_header hide-group',
      title: 'Hide layers from group',
      textContent: 'visibility'
    },
    appendTo: group.header,
    style: {
      display: 'none'
    },
    eventListener: {
      event: 'click',
      funct: e => {
        e.stopPropagation();
        //e.target.style.display = 'none';
    
        // Iterate through all layers and remove layer if layer is in group.
        Object.values(_xyz.layers).forEach(layer => {
          if (layer.group === groupKey && layer.display) layer.remove();
        });

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
    appendTo: group.header,
    eventListener: {
      event: 'click',
      funct: e => {
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent({
          expandable: group.container,
          expandedTag: 'expanded-group',
          expandableTag: 'expandable-group',
          scrolly: document.querySelector('.mod_container > .scrolly')
        });
      }
    }
  });

};