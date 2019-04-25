export default (_xyz, layer) => {

  // Create group object.
  const group = {};

  // Create new layer group.
  _xyz.layers.listview.groups[layer.group] = group;

  // Create layer group container.
  group.container = _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'drawer drawer-group expandable-group'
    },
    appendTo: _xyz.layers.listview.node
  });
  
  // Create layer group header.
  group.header = _xyz.utils.createElement({
    tag: 'div',
    options: {
      textContent: layer.group,
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
          scrolly: _xyz.desktop && _xyz.desktop.listviews,
        });
      }
    }
  });


  // Create group meta container
  group.meta = _xyz.utils.createElement({
    tag: 'div',
    appendTo: group.container
  });

  
  // Check whether some layers group are visible and toggle visible button display accordingly.
  group.chkVisibleLayer = () => {
    let someVisible = Object.values(_xyz.layers.list)
      .some(_layer => (_layer.group === layer.group && _layer.display));
    
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
    eventListener: {
      event: 'click',
      funct: e => {
        e.stopPropagation();
    
        // Iterate through all layers and remove layer if layer is in group.
        Object.values(_xyz.layers.list).forEach(_layer => {
          if (_layer.group === layer.group && _layer.display) layer.remove();
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
          scrolly: _xyz.desktop && _xyz.desktop.listviews,
        });
      }
    }
  });

};