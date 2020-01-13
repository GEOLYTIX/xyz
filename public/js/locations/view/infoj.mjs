export default _xyz => location => {

  if (!location.infoj && location.infoj.length < 1) return;

  location.geometries = location.geometries.filter(geom => {
    _xyz.map.removeLayer(geom)
  });
    
  location.tables = location.tables.filter(table => {
    _xyz.dataview.removeTab(table)
  });

  const listview = _xyz.utils.wire()`<table>`;

  // Create object to hold view groups.
  location.groups = {};

  // watch for group/chart data series and stacks
  let dataset;

  // Iterate through info fields and add to info table.
  for (const entry of location.infoj) {

    if (location.view && location.view.classList.contains('disabled')) break

    if (!entry.edit && entry.value === null) continue

    entry.listview = listview;

    if (document.body.dataset.viewmode === 'report') entry.edit = null;

    entry.location = location;

    // Determine the user-friendly string representation of the value
    entry.displayValue =
      entry.type === 'numeric' ? parseFloat(entry.value).toLocaleString('en-GB', { maximumFractionDigits: 2 }) :
        entry.type === 'integer' ? parseInt(entry.value).toLocaleString('en-GB', { maximumFractionDigits: 0 }) :
          entry.type === 'date' ? _xyz.utils.formatDate(entry.value) :
            entry.type === 'datetime' ? _xyz.utils.formatDateTime(entry.value) :
              entry.value;

    // Add pre- or suffix if specified
    if(entry.prefix) entry.displayValue = entry.prefix + entry.displayValue;
    if(entry.suffix) entry.displayValue = entry.displayValue + entry.suffix;

    entry.row = _xyz.utils.wire()`<tr class=${'lv-' + (entry.level || 0) + ' ' + (entry.class || '')}>`;

    // Create a new table row for the entry.
    if (!entry.group) listview.appendChild(entry.row);

    // Create a new info group.
    if (entry.type === 'group') {

      location.groups[entry.label] = entry;

      _xyz.locations.view.group(entry);
            
      listview.appendChild(location.groups[entry.label].row);
      continue
    }

    // Create entry.row inside previously created group.
    if (entry.group && location.groups[entry.group]){ 

      if(entry.dataset || entry.stack){

        let
          dataset_row = _xyz.utils.wire()`<tr class=${'lv-' + (entry.level || 0) + ' ' + (entry.class || '')}>`,
          dataset_label = _xyz.utils.wire()`<td class="label" colspan=2 style="color: #777;">`;

        if(entry.dataset && entry.dataset !== dataset){
          if(entry.skip) continue
          dataset_label.textContent = entry.dataset;
          dataset_row.appendChild(dataset_label);
          location.groups[entry.group].table.appendChild(dataset_row);
          dataset = entry.dataset;
        }

        if(entry.stack && entry.stack !== dataset){
          dataset_label.textContent = entry.stack;
          dataset_row.appendChild(dataset_label);
          location.groups[entry.group].table.appendChild(dataset_row);
          dataset = entry.stack;
        }

      }

      if(location.groups[entry.group].table) location.groups[entry.group].table.appendChild(entry.row);
      if(location.groups[entry.group].div) location.groups[entry.group].div.style.display = 'block';

    }


    // Create new table cell for the entry label and append to table.
    if (entry.label) {
      entry.label_td = _xyz.utils.wire()`
      <td
        class="${'label lv-' + (entry.level || 0)}"
        title="${entry.title || null}">${entry.label}`;

      entry.row.appendChild(entry.label_td);
    }

    // display layer name in location view
    if(entry.type === 'key') {
     
      listview.appendChild(_xyz.utils.wire()`
      <tr>
      <td class="${'label lv-0 ' + (entry.class || '')}" colspan=2 style="padding: 10px 0;">
      <span title="Source layer"
      style="${'float: right; padding: 3px; cursor: help; border-radius: 2px; background-color: ' + (_xyz.utils.Chroma(location.style.strokeColor).alpha(0.3)) + ';'}"
      >${location.layer.name}`);

      continue
    }


    if (entry.script) {
      window[entry.script](_xyz, entry);
      continue
    }


    if (entry.type === 'label') {
      entry.label_td.colSpan = '2';
      continue
    }


    if (entry.type === 'streetview') {
      _xyz.locations.view.streetview(entry);
      continue
    }


    if (entry.type === 'report') {
      _xyz.locations.view.report(entry);
      continue
    }


    if (entry.type === 'images') {
      _xyz.locations.view.images(entry);
      continue
    }


    if (entry.custom && _xyz.locations.custom[entry.custom]) {
      _xyz.locations.custom[entry.custom](entry);
      continue
    }


    if (entry.type === 'documents') {
      _xyz.locations.view.documents(entry);
      continue
    }


    if (entry.type === 'geometry') {
      _xyz.locations.view.geometry(entry);
      continue
    }


    if (entry.type === 'meta') {
      _xyz.locations.view.meta(entry);
      continue
    }


    if (entry.type === 'boolean') {
      _xyz.locations.view.boolean(entry);    
      continue
    }


    if (entry.type === 'tableDefinition') {
      _xyz.locations.view.tableDefinition(entry);
      continue
    }


    if (entry.type === 'orderedList') {
      _xyz.locations.view.orderedList(entry);  
      continue
    }


    if (entry.type === 'dashboard') {
      _xyz.locations.view.dashboard(entry);
      continue
    }


    // prevent clusterArea from firing if layer is not cluster
    if(entry.clusterArea && location.layer.format !== 'cluster') continue


    // Remove empty row which is not editable.
    if (!entry.edit && !entry.displayValue) {
      entry.row.remove();
      continue
    }


    // Create val table cell in a new line.
    if (!entry.inline && !(entry.type === 'integer' ^ entry.type === 'numeric' ^ entry.type === 'date')) {

      if(entry.label_td) entry.label_td.colSpan = '2';

      // Create new row and append to table.
      //entry.row = _xyz.utils.wire()`<tr>`;
      entry.row = _xyz.utils.wire()`<tr class=${'lv-' + (entry.level || 0) + ' ' + (entry.class || '')}>`;

      listview.appendChild(entry.row);

      // Create val table cell with colSpan 2 in the new row to span full width.
      entry.val = _xyz.utils.wire()`<td class="val" colspan=2>`;

      entry.row.appendChild(entry.val);

    // Else create val table cell inline.
    } else {

      // Append val table cell to the same row as the label table cell.
      entry.val = _xyz.utils.wire()`<td class="val num">`;

      entry.row.appendChild(entry.val);
    }

    // Create controls for editable fields.
    if (entry.edit && !entry.fieldfx) {
      _xyz.locations.view.edit.input(entry);
      continue
    }

    if (entry.type === 'html') {

      // Directly set the HTML if raw HTML was specified
      entry.val.innerHTML = entry.value;
      continue

    } else {

      // otherwise use the displayValue
      entry.val.textContent = entry.displayValue;
      continue
    }

  };

  return listview;

};