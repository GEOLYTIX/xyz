export default (_xyz, location) => () => {

  location.geometries.forEach(
    geom => _xyz.map.removeLayer(geom)
  );
    
  location.geometries = [];

  location.tables.forEach(
    table => _xyz.tableview.removeTab(table)
  );
    
  location.tables = [];


  // Remove all children from view node prior to update.
  if (location.view.node) while (location.view.node.lastChild) {
    location.view.node.removeChild(location.view.node.lastChild);
    console.log('lv node children removed');

  } else {

    // Create view node.
    location.view.node = _xyz.utils.createElement({
      tag: 'table',
      options: {
        className: 'locationview'
      },
      style: {
        cellPadding: '0',
        cellSpacing: '0',
        //borderBottom: '1px solid ' + location.style.color
      },
    });

  }

  // Adds layer to beginning of infoj array.
  location.infoj.unshift({
    'label': 'Layer',
    'value': _xyz.layers.list[location.layer].name,
    'type': 'text',
    'inline': true
  });

  // Create object to hold view groups.
  location.view.groups = {};

  // Iterate through info fields to fill displayValue property
  // This must come before the adding-to-table loop so displayValues for all group members are already existent when groups are created!
  Object.values(location.infoj).forEach(entry => {

    entry.location = location;

    // Determine the user-friendly string representation of the value
    entry.displayValue =
      entry.type === 'numeric' ? parseFloat(entry.value).toLocaleString('en-GB', { maximumFractionDigits: 2 }) :
        entry.type === 'integer' ? parseInt(entry.value).toLocaleString('en-GB', { maximumFractionDigits: 0 }) :
          entry.type === 'date' ? _xyz.utils.formatDate(entry.value) :
            entry.type === 'datetime' ? _xyz.utils.formatDateTime(entry.value) :
              entry.value;
    
    // Add pre- or postfix if specified
    if(entry.prefix)  entry.displayValue = entry.prefix + entry.displayValue;
    if(entry.postfix) entry.displayValue = entry.displayValue + entry.postfix;
  });
    
  // Iterate through info fields and add to info table.
  Object.values(location.infoj).forEach(entry => {

    // Create a new table row for the entry.
    if (!entry.group) entry.row = _xyz.utils.createElement({
      tag: 'tr',
      options: {
        className: 'lv-' + (entry.level || 0)
      },
      appendTo: location.view.node
    });

    // Create a new info group.
    if (entry.type === 'group') return location.view.group(entry);

    // Create entry.row inside previously created group.
    if (entry.group && location.view.groups[entry.group]) entry.row = _xyz.utils.createElement({
      tag: 'tr',
      options: {
        className: 'lv-' + (entry.level || 0)
      },
      appendTo: location.view.groups[entry.group].table
    });

    // Create new table cell for the entry label and append to table.
    let _label;
    if (entry.label) {
      _label = _xyz.utils.createElement({
        tag: 'td',
        options: {
          className: 'label lv-' + (entry.level || 0),
          textContent: entry.label,
          title: entry.title || null
        },
        appendTo: entry.row
      });
    }

    // Finish entry creation if entry has not type.
    if (entry.type === 'label') return;

    // Create streetview control.
    if (entry.type === 'streetview') return location.view.streetview(entry);

    // If input is images create image control and return from object.map function.
    if (entry.type === 'images') return location.view.images(entry);

    // Create geometry control.
    if (entry.type === 'geometry') return location.view.geometry(entry);    

    if (entry.type === 'tableDefinition') return location.view.tableDefinition(entry);    

    // Remove empty row which is not editable.
    if (!entry.edit && !entry.value) return entry.row.remove();

    // Create val table cell in a new line.
    if (!entry.inline && !(entry.type === 'integer' ^ entry.type === 'numeric' ^ entry.type === 'date')) {

      if(_label) _label.colSpan = '2';

      // Create new row and append to table.
      entry.row = _xyz.utils.createElement({
        tag: 'tr',
        appendTo: location.view.node
      });

      // Create val table cell with colSpan 2 in the new row to span full width.
      entry.val = _xyz.utils.createElement({
        tag: 'td',
        options: {
          className: 'val',
          colSpan: '2'
        },
        appendTo: entry.row
      });

      // Else create val table cell inline.
    } else {

      // Append val table cell to the same row as the label table cell.
      entry.val = _xyz.utils.createElement({
        tag: 'td',
        options: {
          className: 'val num'
        },
        appendTo: entry.row
      });

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
  Object.values(location.infoj).map(entry => {

    if(!entry.group) return;
      
    if(!location.view.groups[entry.group].table.innerHTML) {
      location.groups[entry.group].table.parentNode.style.display = 'none';
    }
      
  });

};