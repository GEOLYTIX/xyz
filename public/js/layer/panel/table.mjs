export default (_xyz, layer) => {

  if(!layer.tableview || !layer.tableview.tables) return;

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

  // Return if tableview has no table definition.
  if(!layer.tableview.tables) return;

  // Iterate through tables entries.
  Object.entries(layer.tableview.tables).forEach(table => {

    // Assign table key.
    table[1].key = table[0];

    // Create table immediately if display is set to true.
    if (table[1].display) _xyz.tableview.layerTable({
      target: _xyz.tableview.node.querySelector('.table'),
      layer: layer,
      table: table[1],
    });

    // Create checkbox to toggle whether table is in tabs list.
    _xyz.utils.createCheckbox({
      label: table[1].title || table[0],
      appendTo: layer.tableview.panel,
      checked: !!table[1].display,
      onChange: e => {

        e.stopPropagation();

        if (e.target.checked) _xyz.tableview.layerTable({
          target: _xyz.tableview.node.querySelector('.table'),
          layer: layer,
          table: table[1],
        });

        if (!e.target.checked) _xyz.tableview.removeTab({
          layer: layer,
          table: table[1],
        });

      }
    });

  });

};