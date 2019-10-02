export default (_xyz, location) => () => {

  location.geometries.forEach(geom => _xyz.map.removeLayer(geom));
    
  location.geometries = [];

  location.tables.forEach(table => _xyz.dataview.removeTab(table));
    
  location.tables = [];


  // Wire up locationview table to view node.
  if (location.view.node) while (location.view.node.lastChild) {
    location.view.node.removeChild(location.view.node.lastChild);

  } else {

    location.view.node = _xyz.utils.wire()`<table class="locationview">`;
  }

  // Create object to hold view groups.
  location.view.groups = {};

  // Iterate through info fields to fill displayValue property
  // This must come before the adding-to-table loop so displayValues for all group members are already existent when groups are created!
  location.infoj && Object.values(location.infoj).forEach(entry => {

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
    if(entry.prefix)  entry.displayValue = entry.prefix + entry.displayValue;
    if(entry.suffix) entry.displayValue = entry.displayValue + entry.suffix;
  });
    
  let dataset; // watch for group/chart data series and stacks

  // Iterate through info fields and add to info table.
  location.infoj && Object.values(location.infoj).forEach(entry => {

    entry.row = _xyz.utils.wire()`<tr class=${'lv-' + (entry.level || 0) + ' ' + (entry.class || '')}>`;

    // Create a new table row for the entry.
    if (!entry.group) location.view.node.appendChild(entry.row);

    // Create a new info group.
    if (entry.type === 'group') return location.view.group(entry);

    // Create entry.row inside previously created group.
    if (entry.group && location.view.groups[entry.group]){ 

      if(entry.dataset || entry.stack){

        let
          dataset_row = _xyz.utils.wire()`<tr class=${'lv-' + (entry.level || 0) + ' ' + (entry.class || '')}>`,
          dataset_label = _xyz.utils.wire()`<td class="label" colspan=2 style="color: #777; font-size: small;">`;

        if(entry.dataset && entry.dataset !== dataset){
          dataset_label.textContent = entry.dataset;
          dataset_row.appendChild(dataset_label);
          location.view.groups[entry.group].table.appendChild(dataset_row);
          dataset = entry.dataset;
        }

        if(entry.stack && entry.stack !== dataset){
          dataset_label.textContent = entry.stack;
          dataset_row.appendChild(dataset_label);
          location.view.groups[entry.group].table.appendChild(dataset_row);
          dataset = entry.stack;
        }

      }
      
      location.view.groups[entry.group].table.appendChild(entry.row); 
    }
    

    // Create new table cell for the entry label and append to table.
    if (entry.label) {
      entry.label_td = _xyz.utils.wire()`
      <td class="${'label lv-' + (entry.level || 0)}"
      title="${entry.title || null}">${entry.label}`;

      entry.row.appendChild(entry.label_td);
    }
    
    // display layer name in location view
    if(entry.type === 'key') {
     
      return location.view.node.appendChild(_xyz.utils.wire()`
      <tr>
      <td class="${'label lv-0 ' + (entry.class || '')}" colspan=2 style="padding: 10px 0;">
      <span title="Source layer"
      style="${'float: right; padding: 3px; font-size: 12px; cursor: help; border-radius: 2px; background-color: ' + (_xyz.utils.Chroma(location.style.strokeColor).alpha(0.3)) + ';'}"
      >${location.layer.name}`);

    }

    // Finish entry creation if entry has not type.
    if (entry.type === 'label') return entry.label_td.colSpan = '2';

    // Create streetview control.
    if (entry.type === 'streetview') return location.view.streetview(entry);

    // Create report control.
    if (entry.type === 'report') return location.view.report(entry);

    // If input is images create image control and return from object.map function.
    if (entry.type === 'images') return location.view.images(entry);

    // Custom methods
    if (entry.custom) {
      _xyz.locations.custom[entry.custom] && _xyz.locations.custom[entry.custom](entry);
      return;
    }

    // If input is documents create document control and return from object.map function.
    if (entry.type === 'documents') return location.view.documents(entry);

    // Create geometry control.
    if (entry.type === 'geometry') return location.view.geometry(entry);

    // Create metadata entry
    if (entry.type === 'meta') return location.view.meta(entry);

    // Create boolean control.
    if (entry.type === 'boolean') return location.view.boolean(entry);    

    if (entry.type === 'tableDefinition') return location.view.tableDefinition(entry);

    if (entry.type === 'orderedList') return location.view.orderedList(entry);  

    if (entry.type === 'dashboard') return location.view.dashboard(entry);

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


      location.view.node.appendChild(entry.row);
      

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
    if (entry.edit && !entry.fieldfx) return location.view.edit(entry);

    if (entry.type === 'html') {

      // Directly set the HTML if raw HTML was specified
      return entry.val.innerHTML = entry.value;

    } else {

      // otherwise use the displayValue
      return entry.val.textContent = entry.displayValue;
    }

  });

  // Hide group if empty
  location.infoj && Object.values(location.infoj).map(entry => {

    if(!entry.group) return;
      
    if(location.view.groups[entry.group]
      && location.view.groups[entry.group].table
      && !location.view.groups[entry.group].table.innerHTML) {
      location.view.groups[entry.group].table.parentNode.style.display = 'none';
    }
      
  });

};