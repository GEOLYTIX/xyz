export default (_xyz, layer) => {
  
  if(!layer.dataview || !layer.dataview.tables || !layer.dataview.charts) return;

  // Create cluster panel and add to layer dashboard.
  layer.dataview.panel = _xyz.utils.wire()`<div class="panel expandable">`;

  layer.view.dashboard.appendChild(layer.dataview.panel);

  // Panel title / expander.
  layer.dataview.panel.appendChild(_xyz.utils.wire()`
    <div class="btn_text cursor noselect"
    onclick=${e => {
      e.stopPropagation();
      _xyz.utils.toggleExpanderParent({
        expandable: layer.dataview.panel,
        accordeon: true,
      });
    }}
    >Data View
  `);

  // Return if dataview has no table definition.
  //if(!layer.dataview.tables) return;

  if(!_xyz.dataview.node) return;

  // Iterate through tables entries.
  if(layer.dataview.tables){
    Object.keys(layer.dataview.tables).forEach(key => {

      const table = layer.dataview.tables[key];

      table.key = key;
      table.layer = layer;
      table.title = table.title || key;
      table.target = _xyz.dataview.node.querySelector('.table');

      if(!table.target) table.target = _xyz.dataview.tableContainer();

      table.show = ()=>_xyz.dataview.layerTable(table);
      table.remove = ()=>_xyz.dataview.removeTab(table);

      // Create checkbox to toggle whether table is in tabs list.
      layer.dataview.panel.appendChild(_xyz.utils.wire()`
        <label class="checkbox"
        onchecked=${!!table.display}
        onchange=${e => {
          table.display = e.target.checked;
          return table.display ? layer.show() : table.remove();
        }}
        >${table.title}
      `);

      if (table.display && layer.display) table.show();
    });
  }

  if(layer.dataview.charts){

    Object.keys(layer.dataview.charts).forEach(key => {

      const chart = layer.dataview.charts[key];

      chart.key = key;
      chart.layer = layer;
      chart.title = chart.title || key;
      chart.target = _xyz.dataview.node.querySelector('.table');

      if(!chart.target) chart.target = _xyz.dataview.tableContainer();

      chart.show = ()=>_xyz.dataview.dashboard(chart);
      chart.remove = ()=>_xyz.dataview.removeTab(chart);

      // Create checkbox to toggle whether table is in tabs list.
      layer.dataview.panel.appendChild(_xyz.utils.wire()`
        <label class="checkbox"
        onchecked=${!!chart.display}
        onchange=${e => {
          chart.display = e.target.checked;
          return chart.display ? layer.show() : chart.remove();
        }}
        >${chart.title}
      `);
      
      if (chart.display && layer.display) chart.show();
    });
  }
};