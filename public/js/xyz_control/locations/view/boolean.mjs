export default _xyz => entry => {

  // Create new row and append to table.
  entry.row = _xyz.utils.wire()`<tr>`;

  entry.location.view.node.appendChild(entry.row);
  
  // Create val table cell with colSpan 2 in the new row to span full width.
  entry.val = _xyz.utils.wire()`<td class="val" colSpan=2>`;

  entry.row.appendChild(entry.val);

  entry.val.appendChild(_xyz.utils.wire()`
  <td style="padding-top: 5px;" colSpan=2>
  <label class="checkbox">${entry.name || entry.field}
  <input type="checkbox"
    disabled=${!entry.edit}
    checked=${!!entry.value}
    onchange=${e => entry.location.view.valChange({
    input: e.target,
    entry: entry,
    value: e.target.checked
  })}>
  <div class="checkbox_i">`);

};