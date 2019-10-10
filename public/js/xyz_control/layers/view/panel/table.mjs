export default (_xyz, layer) => {

  if (!layer.dataview || !_xyz.dataview.node) return;

  if (!layer.dataview.tables && !layer.dataview.charts) return;

  // Create table panel and add to layer dashboard.
  layer.dataview.panel = _xyz.utils.wire()`<div class="panel expandable">`;

  layer.view.dashboard.appendChild(layer.dataview.panel);

  // Table panel header.
  const header = _xyz.utils.wire()`
    <div
    class="btn_text cursor noselect"
    onclick=${e => {
    e.stopPropagation();
    _xyz.utils.toggleExpanderParent({
      expandable: layer.dataview.panel,
      accordeon: true,
    });}}>Data View`;

  layer.dataview.panel.appendChild(header);

  if (layer.dataview.tables) {

    Object.keys(layer.dataview.tables).forEach(key => {

      const table = layer.dataview.tables[key];

      table.key = key;
      table.layer = layer;
      table.title = table.title || key;

      table.target = _xyz.dataview.node.querySelector('.table') || _xyz.dataview.tableContainer();

      table.show = () => _xyz.dataview.layerTable(table);
      table.remove = () => _xyz.dataview.removeTab(table);

      // Create checkbox to toggle whether table is in tabs list.
      layer.dataview.panel.appendChild(_xyz.utils.wire()`
        <label class="checkbox">
        <input
          type="checkbox"
          checked=${!!table.display}
          onchange=${e => {
            table.display = e.target.checked;
            if (table.display) return layer.show();
            table.remove();}}></input><span>${table.title}`);

      if (table.display && layer.display) table.show();
    });

  }

  if (layer.dataview.charts) {

    Object.keys(layer.dataview.charts).forEach(key => {

      const chart = layer.dataview.charts[key];
        
      chart.key = key;
      chart.layer = layer;
      chart.title = chart.title || key;

      chart.target = _xyz.dataview.node.querySelector('.table') || _xyz.dataview.tableContainer();

      chart.show = () => _xyz.dataview.layerDashboard(chart);
      chart.remove = () => _xyz.dataview.removeTab(chart);

      // Create checkbox to toggle whether table is in tabs list.
      layer.dataview.panel.appendChild(_xyz.utils.wire()`
        <label class="checkbox">
        <input
          type="checkbox"
          checked=${!!chart.display}
          onchange=${e => {
            chart.display = e.target.checked;
            if (chart.display) return layer.show();
            chart.remove();}}></input><span>${chart.title}`);

      if (chart.display && layer.display) chart.show();
    });

  }

};