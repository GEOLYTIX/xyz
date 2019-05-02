export default (_xyz, layer) => {

  const panel = _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'panel'
    },
    appendTo: layer.dashboard
  });

  // Create grid_size dropdown.
  _xyz.utils.dropdown({
    appendTo: panel,
    entries: layer.grid_fields,
    selected: Object.keys(layer.grid_fields).find(key => layer.grid_fields[key] === layer.grid_size),
    onchange: e => {
      layer.grid_size = layer.grid_fields[e.target.value];
      layer.get();
    }
  });

  // Create a D3 svg for the legend and nest between size and color drop down.
  layer.style.setLegend(panel);

  // Create grid_color dropdown.
  _xyz.utils.dropdown({
    appendTo: panel,
    entries: layer.grid_fields,
    selected:  Object.keys(layer.grid_fields).find(key => layer.grid_fields[key] === layer.grid_color),
    onchange: e => {
      layer.grid_color = layer.grid_fields[e.target.value];
      layer.get();
    }
  });

  // Create grid_ratio checkbox.
  _xyz.utils.createCheckbox({
    label: 'Display colour values as a ratio to the size value.',
    checked: layer.grid_ratio,
    appendTo: panel,
    onChange: e => {
      layer.grid_ratio = e.target.checked;
      layer.get();
    }
  });

};