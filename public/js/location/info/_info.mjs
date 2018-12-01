import _xyz from '../../_xyz.mjs';

import group from './group.mjs';

import streetview from './streetview.mjs';

import images from './images/_images.mjs';

import geometry from './geometry.mjs';

import log from './log.mjs';

import edit from './edit/_edit.mjs';

export default record => {

  // Add table element to record drawer.
  // info fields will be added to this table.
  record.table = _xyz.utils.createElement({
    tag: 'table',
    options: {
      className: 'infojTable'
    },
    style: {
      cellPadding: '0',
      cellSpacing: '0',
      borderBottom: '1px solid ' + record.color
    },
    appendTo: record.drawer
  });

  record.update = () => {

    record.table.innerHTML = '';

    // Adds layer to beginning of infoj array.
    record.location.infoj.unshift({
      'label': 'Layer',
      'value': _xyz.layers.list[record.location.layer].name,
      'type': 'text',
      'inline': true
    });

    // Adds layer group to beginning of infoj array.
    if (_xyz.layers.list[record.location.layer].group) record.location.infoj.unshift({
      'label': 'Group',
      'value': _xyz.layers.list[record.location.layer].group,
      'type': 'text',
      'inline': true
    });

    // Assign location object to hold info groups.
    record.location.infogroups = {};

    // Iterate through info fields and add to info table.
    Object.values(record.location.infoj).forEach(entry => {

    // Create a new table row for the entry.
      if (!entry.group) entry.row = _xyz.utils.createElement({
        tag: 'tr',
        options: {
          className: 'lv-' + (entry.level || 0)
        },
        appendTo: record.table
      });

      // Create a new info group.
      if (entry.type === 'group') return group(record, entry);

      // Create entry.row inside previously created group.
      if (entry.group) entry.row = _xyz.utils.createElement({
        tag: 'tr',
        options: {
          className: 'lv-' + (entry.level || 0)
        },
        appendTo: record.location.infogroups[entry.group].table
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

      // Create streetview control.
      if (entry.type === 'streetview') return streetview(record, entry);

      // If input is images create image control and return from object.map function.
      if (entry.type === 'images') return images(record, entry);

      // Create log control.
      if (entry.type === 'log') return log(record, entry);

      // Create geometry control.
      if (entry.type === 'geometry') return geometry(record, entry);    

      // Remove empty row which is not editable.
      if (!entry.edit && !entry.value) return entry.row.remove();

      // Create val table cell in a new line.
      if (!entry.inline && !(entry.type === 'integer' ^ entry.type === 'numeric' ^ entry.type === 'date')) {

      // Create new row and append to table.
        entry.row = _xyz.utils.createElement({
          tag: 'tr',
          appendTo: record.table
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
      if (entry.edit && !entry.fieldfx) return edit(record, entry);

      // Set field value.
      entry.val.textContent =
      entry.type === 'numeric' ? parseFloat(entry.value).toLocaleString('en-GB', { maximumFractionDigits: 2 }) :
        entry.type === 'integer' ? parseInt(entry.value).toLocaleString('en-GB', { maximumFractionDigits: 0 }) :
          entry.type === 'date' ? _xyz.utils.formatDate(entry.value) :
            entry.type === 'datetime' ? _xyz.utils.formatDateTime(entry.value) :
              entry.value;

    });

  };

  record.update();
  
};