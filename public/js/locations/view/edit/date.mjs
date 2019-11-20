export default _xyz => entry => {

  const _input = _xyz.utils.wire()`<input type="text">${entry.type === 'datetime' && _xyz.utils.formatDateTime(entry.value) || _xyz.utils.formatDate(entry.value) || ''}`;

  const input = _input.childNodes[0];

  input.value = entry.type === 'datetime' && _xyz.utils.formatDateTime(entry.value) || _xyz.utils.formatDate(entry.value) || '';

  entry.val.appendChild(input);
  
  _xyz.utils.datePicker({
    element: input,
    position: 'c',
    formatter: (input, date) => {

      const meltDateStr = _xyz.utils.meltDateStr(date);

      input.value = entry.type === 'datetime' ?
        _xyz.utils.formatDateTime(meltDateStr) :
        _xyz.utils.formatDate(meltDateStr);

      entry.location.view.dispatchEvent(
        new CustomEvent('valChange', {detail:{
          input: input,
          entry: entry,
          newValue: meltDateStr,
        }}))  
    },
    onSelect: (instance, date) => {},
    onShow: instance => {}
  });

};