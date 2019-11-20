export default _xyz => entry => {

  entry.listview.appendChild(_xyz.utils.wire()`
  <tr>
    <td style="padding-top: 5px;" colSpan=2>
      <label class="input-checkbox">
        <input type="checkbox"
          disabled=${!entry.edit}
          checked=${!!entry.value}
          onchange=${e => {
            entry.location.view.dispatchEvent(
              new CustomEvent('valChange', {detail:{
                input: e.target,
                entry: entry,
                newValue: !!e.target.checked,
              }}))
          }}>
        </input>
        <div></div><span>${entry.name || entry.field}`);

};