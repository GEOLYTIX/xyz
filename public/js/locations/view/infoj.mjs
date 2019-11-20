export default _xyz => location => {

  location.geometries = location.geometries.filter(geom => {
    _xyz.map.removeLayer(geom)
  });
    
  location.tables = location.tables.filter(table => {
    _xyz.dataview.removeTab(table)
  });

  const listview = _xyz.utils.wire()`<table class="locationview">`;

  // Create object to hold view groups.
  const groups = {};

  // Iterate through info fields to fill displayValue property
  // This must come before the adding-to-table loop so displayValues for all group members are already existent when groups are created!
  location.infoj && Object.values(location.infoj).forEach(entry => {

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
  });

  // watch for group/chart data series and stacks
  let dataset;

  // Iterate through info fields and add to info table.
  location.infoj && Object.values(location.infoj).forEach(entry => {

    entry.row = _xyz.utils.wire()`<tr class=${'lv-' + (entry.level || 0) + ' ' + (entry.class || '')}>`;

    // Create a new table row for the entry.
    if (!entry.group) listview.appendChild(entry.row);

    // Create a new info group.
    if (entry.type === 'group') {
      const group = _xyz.locations.view.group(entry);
      if (!group) return;
      groups[group.label] = group;
      return listview.appendChild(group.row);
    }

    // Create entry.row inside previously created group.
    if (entry.group && groups[entry.group]){ 

      if(entry.dataset || entry.stack){

        let
          dataset_row = _xyz.utils.wire()`<tr class=${'lv-' + (entry.level || 0) + ' ' + (entry.class || '')}>`,
          dataset_label = _xyz.utils.wire()`<td class="label" colspan=2 style="color: #777;">`;

        if(entry.dataset && entry.dataset !== dataset){
          dataset_label.textContent = entry.dataset;
          dataset_row.appendChild(dataset_label);
          groups[entry.group].table.appendChild(dataset_row);
          dataset = entry.dataset;
        }

        if(entry.stack && entry.stack !== dataset){
          dataset_label.textContent = entry.stack;
          dataset_row.appendChild(dataset_label);
          groups[entry.group].table.appendChild(dataset_row);
          dataset = entry.stack;
        }

      }

      groups[entry.group].table.appendChild(entry.row); 
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
     
      return listview.appendChild(_xyz.utils.wire()`
      <tr>
      <td class="${'label lv-0 ' + (entry.class || '')}" colspan=2 style="padding: 10px 0;">
      <span title="Source layer"
      style="${'float: right; padding: 3px; cursor: help; border-radius: 2px; background-color: ' + (_xyz.utils.Chroma(location.style.strokeColor).alpha(0.3)) + ';'}"
      >${location.layer.name}`);

    }


    if (entry.type === 'label') return entry.label_td.colSpan = '2';


    if (entry.type === 'streetview') return _xyz.locations.view.streetview(entry);


    if (entry.type === 'report') return _xyz.locations.view.report(entry);


    // If input is images create image control and return from object.map function.
    if (entry.type === 'images') return _xyz.locations.view.images(entry);


    if (entry.custom && _xyz.locations.custom[entry.custom]) return _xyz.locations.custom[entry.custom](entry);


    if (entry.type === 'documents') return _xyz.locations.view.documents(entry);


    if (entry.type === 'geometry') return _xyz.locations.view.geometry(entry);


    if (entry.type === 'meta') return _xyz.locations.view.meta(entry);


    if (entry.type === 'boolean') return _xyz.locations.view.boolean(entry);    


    if (entry.type === 'tableDefinition') return _xyz.locations.view.tableDefinition(entry);


    if (entry.type === 'orderedList') return _xyz.locations.view.orderedList(entry);  


    if (entry.type === 'dashboard') return _xyz.locations.view.dashboard(entry);


    // prevent clusterArea from firing if layer is not cluster
    if(entry.clusterArea && location.layer.format !== 'cluster') return;


    // Remove empty row which is not editable.
    if (!entry.edit && !entry.value) return entry.row.remove();


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
    if (entry.edit && !entry.fieldfx) return _xyz.locations.view.edit.input(entry);

    if (entry.type === 'html') {

      // Directly set the HTML if raw HTML was specified
      return entry.val.innerHTML = entry.value;

    } else {

      // otherwise use the displayValue
      return entry.val.textContent = entry.displayValue;
    }

  });

  // Hide group if empty
  // location.infoj && Object.values(location.infoj).map(entry => {

  //   if(!entry.group) return;

  //   if(groups[entry.group]
  //     && groups[entry.group].table
  //     && !groups[entry.group].table.innerHTML) {
  //     groups[entry.group].table.parentNode.style.display = 'none';
  //   }

  // });

  return listview;

};