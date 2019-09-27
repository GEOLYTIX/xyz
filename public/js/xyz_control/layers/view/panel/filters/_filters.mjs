import filter_text from './filter_text.mjs';

import filter_numeric from './filter_numeric.mjs';

import filter_in from './filter_in.mjs';

import filter_date from './filter_date.mjs';

import chkCount from './chkCount.mjs';

import filter_boolean from './filter_boolean.mjs';

export default (_xyz, layer) => {

  if (!layer.infoj) return;

  if (!layer.infoj.some(entry => entry.filter)) return;

  // Create current filter object.
  layer.filter.current = {};

  const infoj = layer.infoj.filter(entry => entry.filter);

  // Add select info to infoj array of filter entries.
  infoj.unshift('Select filter from list.');

  // Add filter panel to layer dashboard.
  const panel = _xyz.utils.wire()`<div class="${'panel expandable ' + (layer.style.theme ? 'expanded': '')}">`;

  layer.view.dashboard.appendChild(panel);


  // Style panel header.
  const header = _xyz.utils.wire()`
    <div
    class="btn_text cursor noselect"
    onclick=${e => {
    e.stopPropagation();
  
    _xyz.utils.toggleExpanderParent({
      expandable: panel,
      accordeon: true,
      scrolly: _xyz.desktop && _xyz.desktop.listviews,
    });

  }}>Filter`;
  
  panel.appendChild(header);



  // Create locales _xyz.utils.dropdown.
  layer.filter.select = _xyz.utils.dropdown({
    appendTo: panel,
    entries: infoj,
    label: 'label',
    val: 'field',
    onchange: e => {

      const entry = infoj.find(entry => entry.field === e.target.value);

      // Disable the current filter in _xyz.utils.dropdown.
      layer.filter.select.options[layer.filter.select.selectedIndex].disabled = true;

      // Set selected index back to select text.
      layer.filter.select.selectedIndex = 0;

      // Display clear all button.
      layer.filter.clear_all.style.display = 'block';

      if (entry.filter == 'date') return filter_date(_xyz, layer, entry);

      if (entry.filter === 'numeric') return filter_numeric(_xyz, layer, entry);

      if (entry.filter === 'like' || entry.filter === 'match') return filter_text(_xyz, layer, entry);

      if (entry.filter.in) return filter_in(_xyz, layer, entry);

      if (entry.filter === 'boolean') return filter_boolean(_xyz, layer, entry);

    }
  });

  layer.filter.clear_all = _xyz.utils.wire()`
  <div class="btn_small cursor noselect" onclick=${e=>clearall(e)}>Clear all filters`;
  panel.appendChild(layer.filter.clear_all);

  function clearall(e) {

    e.target.style.display = 'none';

    // Remove all filter blocks.
    layer.filter.list.innerHTML = null;

    // Enable all options in _xyz.utils.dropdown.
    Object.values(layer.filter.select.options).forEach(opt => opt.disabled = false);

    // Reset layer filter object.
    layer.filter.current = {};

    layer.show();
  };


  layer.filter.list = _xyz.utils.wire()`<div>`;
  panel.appendChild(layer.filter.list);
  


  layer.filter.run_output = _xyz.utils.wire()`
  <button disabled class="btn_wide noselect" onclick=${e=>output(e)}>Run Output`;

  panel.appendChild(layer.filter.run_output);

  function output(e){

    if (e.target.disabled) return;

    const filter = Object.assign({}, layer.filter.legend, layer.filter.current);
  
    const xhr = new XMLHttpRequest();
        
    xhr.open(
      'GET',
      _xyz.host + '/api/location/select/aggregate?' +
      _xyz.utils.paramString({
        locale: _xyz.workspace.locale.key,
        layer: layer.key,
        table: layer.table,
        filter: JSON.stringify(filter),
        token: _xyz.token
      }));
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';
    xhr.onload = e => {

      if (e.target.status !== 200) return;
  
      _xyz.locations.select({
        _new: true,
        geometry: JSON.parse(e.target.response.geomj),
        infoj: e.target.response.infoj,
        layer: layer,
      });

    };
    xhr.send();
  }

  if (!layer.filter.infoj) layer.filter.run_output.style.display = 'none';

  layer.filter.check_count = chkCount(_xyz, layer);

  layer.filter.check_count();

};