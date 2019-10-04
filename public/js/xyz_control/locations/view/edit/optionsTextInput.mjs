export default _xyz => entry => {

  if (!typeof entry.edit.options[entry.select.selectedIndex] === 'object') return;

  if (!entry.edit.options[entry.select.selectedIndex]
    || Object.values(entry.edit.options[entry.select.selectedIndex])[0] !== 'text') return;

    entry.select_other = _xyz.utils.wire()`
  <input type="text"
  onkeyup=${
    e => {
      entry.location.view.valChange({input: e.target, entry: entry})
    }
  }>`;

  entry.select_other.value = Object.keys(entry.edit.options[entry.select.selectedIndex])[0];

  entry.val.appendChild(entry.select_other);

};