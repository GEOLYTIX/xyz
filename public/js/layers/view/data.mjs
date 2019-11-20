export default _xyz => {

  const data = {

    panel: panel,

  }

  return data;


  function panel(layer) {

    if (!layer.dataview || !_xyz.dataview.node) return;

    const panel = _xyz.utils.wire()`
    <div class="drawer panel expandable">`;
  
    // Panel header
    panel.appendChild(_xyz.utils.wire()`
    <div
      class="header primary-colour"
      onclick=${e => {
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent(e.target, true);
      }}><span>Data Views</span><button
      class="btn-header xyz-icon icon-expander primary-colour-filter">`);

      Object.keys(layer.dataview).forEach(key => {

        const tab = layer.dataview[key];

        tab.key = key;
        tab.layer = layer;
        tab.title = tab.title || key;

        tab.target = _xyz.dataview.node.querySelector('.table') || _xyz.dataview.tableContainer();

        tab.show = () => tab.chart ? _xyz.dataview.layerDashboard(tab) : _xyz.dataview.layerTable(tab);
        tab.remove = () => tab.chart ? _xyz.dataview.removeTab(tab) : _xyz.dataview.removeTab(tab);

        // Create checkbox to toggle whether table is in tabs list.
        panel.appendChild(_xyz.utils.wire()`
        <label class="input-checkbox">
        <input
          type="checkbox"
          checked=${!!tab.display}
          onchange=${e => {
            tab.display = e.target.checked;
            if (tab.display) return layer.show();
            tab.remove();
          }}>
        </input>
        <div></div><span>${tab.title}`);

        if (tab.display && layer.display) tab.show();
      });

    return panel;

  };

}