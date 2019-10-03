export default _xyz => entry => {

  entry.location.view.node.appendChild(_xyz.utils.wire()`
  <tr>
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