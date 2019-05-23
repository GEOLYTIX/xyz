export default (_xyz, location) => () => {

  location.geometries.forEach(
    geom => _xyz.map.removeLayer(geom)
  );
    
  location.geometries = [];

  location.tables.forEach(
    table => _xyz.tableview.removeTab(table)
  );
    
  location.tables = [];


  // Wire up locationview table to view node.
  if (location.view.node) while (location.view.node.lastChild) {
    location.view.node.removeChild(location.view.node.lastChild);

  } else {

    location.view.node = _xyz.utils.hyperHTML.wire()`
    <table class="locationview">`;
  }

  // Create object to hold view groups.
  location.view.groups = {};

  // Iterate through info fields to fill displayValue property
  // This must come before the adding-to-table loop so displayValues for all group members are already existent when groups are created!
  Object.values(location.infoj).forEach(entry => {

    if (document.body.dataset.viewmode === 'report') entry.edit = null;

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

    if (entry.hideInReport && document.body.dataset.viewmode === 'report') return;

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
    if (entry.label) {
      entry.label_td = _xyz.utils.createElement({
        tag: 'td',
        options: {
          className: 'label lv-' + (entry.level || 0),
          textContent: entry.label,
          title: entry.title || null
        },
        appendTo: entry.row
      });
    }

    if(entry.type === 'key') { // display layer name in location view

      entry.row = _xyz.utils.createElement({
        tag: 'tr',
        appendTo: location.view.node
      });

      entry.td = _xyz.utils.createElement({
        tag: 'td',
        options: {
          className: 'label lv-0',
          colSpan: 2
        },
        style: {
          padding: '10px 0'
        },
        appendTo: entry.row
      });

      _xyz.utils.createElement({
        tag: 'span',
        options: {
          textContent: _xyz.layers.list[location.layer].name,
          title: 'Source layer'
        },
        style: {
          fontSize: '12px',
          padding: '3px',
          backgroundColor: _xyz.utils.hexToRGBA(location.style.color, 0.3),
          borderRadius: '2px',
          cursor: 'help',
          float: 'right'
        },
        appendTo: entry.td
      });

      return;
    }

    // Finish entry creation if entry has not type.
    if (entry.type === 'label') return entry.label_td.colSpan = '2';

    // Create streetview control.
    if (entry.type === 'streetview') return location.view.streetview(entry);

    // Create report control.
    if (entry.type === 'report') return location.view.report(entry);

    // If input is images create image control and return from object.map function.
    if (entry.type === 'images') return location.view.images(entry);

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

    // Remove empty row which is not editable.
    if (!entry.edit && !entry.value) return entry.row.remove();

    // Create val table cell in a new line.
    if (!entry.inline && !(entry.type === 'integer' ^ entry.type === 'numeric' ^ entry.type === 'date')) {

      if(entry.label_td) entry.label_td.colSpan = '2';

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
      
    if(location.view.groups[entry.group] && location.view.groups[entry.group].table && !location.view.groups[entry.group].table.innerHTML) {
      location.view.groups[entry.group].table.parentNode.style.display = 'none';
    }
      
  });

};