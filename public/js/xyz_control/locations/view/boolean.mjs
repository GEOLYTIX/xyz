export default _xyz => entry => {

  entry.location.view.node.appendChild(_xyz.utils.wire()`
  <tr>
    <td style="padding-top: 5px;" colSpan=2>
      <label class="checkbox">
        <input type="checkbox"
          disabled=${!entry.edit}
          checked=${!!entry.value}
          onchange=${e => entry.location.view.valChange({
          input: e.target,
          entry: entry,
          value: e.target.checked
        })}></input>
        <span>${entry.name || entry.field}`);
        
};