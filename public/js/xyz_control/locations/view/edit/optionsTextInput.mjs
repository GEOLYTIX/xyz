export default _xyz => entry => {

  if (!typeof entry.edit.options[entry.select.selectedIndex] === 'object') return;

  if (!entry.edit.options[entry.select.selectedIndex]
    || Object.values(entry.edit.options[entry.select.selectedIndex])[0] !== 'text') return;

  entry.select_other = _xyz.utils.createElement({
    tag: 'input',
    options: {
      value: Object.keys(entry.edit.options[entry.select.selectedIndex])[0],
      type: 'text'
    },
    appendTo: entry.val,
    eventListener: {
      event: 'keyup',
      funct: e => entry.location.view.valChange(e.target, entry)
    }
  });

};