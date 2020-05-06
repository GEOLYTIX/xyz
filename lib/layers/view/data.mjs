export default _xyz => {

  const data = {

    panel: panel,

  }

  return data;


  function panel(layer) {

    if (!layer.dataviews || !_xyz.dataviews.tabview.node) return;

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

      Object.entries(layer.dataviews).forEach(dataview => {

        dataview[1].key = dataview[0];
        dataview[1].layer = layer;

        // Create checkbox to toggle whether table is in tabs list.
        panel.appendChild(_xyz.utils.wire()`
        <label class="input-checkbox">
        <input
          type="checkbox"
          checked=${!!dataview[1].display}
          onchange=${e => {
            dataview[1].display = e.target.checked;
            if (dataview[1].display) return _xyz.dataviews.tabview.add(dataview[1]);
            dataview[1].remove();
          }}>
        </input>
        <div></div><span>${dataview[1].title || dataview[0]}`);

        if (dataview[1].display && layer.display) _xyz.dataviews.tabview.add(dataview[1]);
      });

    return panel;

  };

}