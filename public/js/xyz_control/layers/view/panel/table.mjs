export default (_xyz, layer) => {

  if (_xyz.mobile || !layer.tableview || !layer.tableview.tables) return;

  // Create cluster panel and add to layer dashboard.
  layer.tableview.panel = _xyz.utils.wire()`<div class="panel expandable">`;

  layer.view.dashboard.appendChild(layer.tableview.panel);


  // Style panel header.
  const header = _xyz.utils.wire()`
  <div onclick=${e => {
    e.stopPropagation();
    _xyz.utils.toggleExpanderParent({
      expandable: layer.tableview.panel,
      accordeon: true,
      scrolly: _xyz.desktop && _xyz.desktop.listviews,
    });
  }}
  class="btn_text cursor noselect">Table`;
  
  layer.tableview.panel.appendChild(header);

  // Return if tableview has no table definition.
  if (!layer.tableview.tables) return;

  if (!_xyz.tableview.node) return;

  // Iterate through tables entries.
  Object.keys(layer.tableview.tables).forEach(key => {

    const table = layer.tableview.tables[key];

    table.key = key;
    table.layer = layer;
    table.title = table.title || key;
    table.target = _xyz.tableview.node.querySelector('.table');

    if (!table.target) table.target = _xyz.tableview.tableContainer();

    table.show = () => _xyz.tableview.layerTable(table);
    table.remove = () => _xyz.tableview.removeTab(table);

    // Create checkbox to toggle whether table is in tabs list.
    layer.tableview.panel.appendChild(_xyz.utils.wire()`
    <label class="checkbox">${table.title}
    <input type="checkbox"
    checked=${table.display}
    onchange=${e => {
    table.display = e.target.checked;

    table.display ?
      layer.show() :
      table.remove();}}>
    <div class="checkbox_i">`);

    if (table.display && layer.display) table.show();

  });

};