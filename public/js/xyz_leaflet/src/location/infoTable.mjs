export default _xyz => {

  _xyz.locations.infoTable = location => {

  // Add table element to record drawer.
  // info fields will be added to this table.
    const table = _xyz.utils.createElement({
      tag: 'table',
      options: {
        className: 'infojTable'
      },
      style: {
        cellPadding: '0',
        cellSpacing: '0',
        padding: '10px'
      }
    });

    // Assign location object to hold info groups.
    location.infogroups = {};

    // Iterate through info fields and add to info table.
    Object.values(location.infoj).forEach(entry => {

      if (entry.type === 'group') return;

      // Create streetview control.
      if (entry.type === 'streetview') return;

      // If input is images create image control and return from object.map function.
      if (entry.type === 'images') return;
    
      // Create log control.
      if (entry.type === 'log') return;
    
      // Create geometry control.
      if (entry.type === 'geometry') return;  

      // Create a new table row for the entry.
      entry.row = _xyz.utils.createElement({
        tag: 'tr',
        options: {
          className: 'lv-' + (entry.level || 0)
        },
        appendTo: table
      });

      // Create new table cell for the entry label and append to table.
      if (entry.label) _xyz.utils.createElement({
        tag: 'td',
        options: {
          className: 'label lv-' + (entry.level || 0),
          textContent: entry.label,
          title: entry.title || null
        },
        appendTo: entry.row
      });

      // Finish entry creation if entry has not type.
      if(entry.type === 'label') return;

      // Remove empty row which is not editable.
      if (!entry.edit && !entry.value) return entry.row.remove();

      // Create val table cell in a new line.
      if (!entry.inline && !(entry.type === 'integer' ^ entry.type === 'numeric' ^ entry.type === 'date')) {

      // Create new row and append to table.
        entry.row = _xyz.utils.createElement({
          tag: 'tr',
          appendTo: table
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

      // Set field value.
      entry.val.textContent =
      entry.type === 'numeric' ? parseFloat(entry.value).toLocaleString('en-GB', { maximumFractionDigits: 2 }) :
        entry.type === 'integer' ? parseInt(entry.value).toLocaleString('en-GB', { maximumFractionDigits: 0 }) :
          entry.type === 'date' ? _xyz.utils.formatDate(entry.value) :
            entry.type === 'datetime' ? _xyz.utils.formatDateTime(entry.value) :
              entry.value;

    });

    return table;

  };

};