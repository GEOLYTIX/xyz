export default (_xyz, layer) => {

  if(!layer.tableview) return;

  // Create cluster panel and add to layer dashboard.
  layer.tableview.panel = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'panel expandable'
    },
    appendTo: layer.dashboard
  });

  // Panel title / expander.
  _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'btn_text cursor noselect',
      textContent: 'Table'
    },
    appendTo: layer.tableview.panel,
    eventListener: {
      event: 'click',
      funct: e => {
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent({
          expandable: layer.tableview.panel,
          accordeon: true,
          scrolly: document.querySelector('.mod_container > .scrolly')
        });
      }
    }
  });

  _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'btn_state btn_wide cursor noselect',
      textContent: 'Create Table'
    },
    appendTo: layer.tableview.panel,
    eventListener: {
      event: 'click',
      funct: e => {
        e.stopPropagation();

        _xyz.tableview.layerTable({
          target: _xyz.tableview.node.querySelector('.table'),
          layer: layer,
        });
      }
    }
  });

};