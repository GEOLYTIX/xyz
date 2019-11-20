export default _xyz => entry => {

  // Create new row and append to table.
  entry.row = _xyz.utils.createElement({
    tag: 'tr',
    appendTo: entry.location.view.node
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

  const boolean_checkbox = _xyz.utils.createCheckbox({
    label: entry.name || entry.field,
    appendTo: entry.val,
    checked: !!entry.value
  });

  if (!entry.edit) return boolean_checkbox.disabled = true;

  boolean_checkbox.onchange = e => entry.location.view.valChange({
    input: e.target,
    entry: entry,
    value: e.target.checked
  });

};