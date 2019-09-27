export default (_xyz, layer) => {

  if (!layer.tableview || !_xyz.tableview.node) return;

  if (!layer.tableview.tables && !layer.tableview.charts) return;

  // Create table panel and add to layer dashboard.
  layer.tableview.panel = _xyz.utils.wire()`<div class="panel expandable">`;

  layer.view.dashboard.appendChild(layer.tableview.panel);

  // Table panel header.
  const header = _xyz.utils.wire()`
    <div
    class="btn_text cursor noselect"
    onclick=${e => {
    e.stopPropagation();
    _xyz.utils.toggleExpanderParent({
      expandable: layer.tableview.panel,
      accordeon: true,
      scrolly: _xyz.desktop && _xyz.desktop.listviews
    });}}>Data View`;

  layer.tableview.panel.appendChild(header);

  if (layer.tableview.tables) {

    Object.keys(layer.tableview.tables).forEach(key => {

      const table = layer.tableview.tables[key];

      table.key = key;
      table.layer = layer;
      table.title = table.title || key;

      table.target = _xyz.tableview.node.querySelector('.table') || _xyz.tableview.tableContainer();

      table.show = () => _xyz.tableview.layerTable(table);
      table.remove = () => _xyz.tableview.removeTab(table);

      // Create checkbox to toggle whether table is in tabs list.
      layer.tableview.panel.appendChild(_xyz.utils.wire()`
        <label class="checkbox">${table.title}
        <input
          type="checkbox"
          checked=${!!table.display}
          onchange=${e => {
            table.display = e.target.checked;
            if (table.display) return layer.show();
            table.remove();}}>
        <div class="checkbox_i">`);

      if (table.display && layer.display) table.show();
    });

  }

  if (layer.tableview.charts) {

    Object.keys(layer.tableview.charts).forEach(key => {

      const chart = layer.tableview.charts[key];
        
      chart.key = key;
      chart.layer = layer;
      chart.title = chart.title || key;

      chart.target = _xyz.tableview.node.querySelector('.table') || _xyz.tableview.tableContainer();

      chart.show = () => _xyz.tableview.layerDashboard(chart);
      chart.remove = () => _xyz.tableview.removeTab(chart);

      // Create checkbox to toggle whether table is in tabs list.
      layer.tableview.panel.appendChild(_xyz.utils.wire()`
        <label class="checkbox">${chart.title}
        <input
          type="checkbox"
          checked=${!!chart.display}
          onchange=${e => {
            chart.display = e.target.checked;
            if (chart.display) return layer.show();
            chart.remove();}}>
        <div class="checkbox_i">`);

      if (chart.display && layer.display) chart.show();
    });

  }

};