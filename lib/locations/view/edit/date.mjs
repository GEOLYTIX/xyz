export default _xyz => entry => {

  const _input = _xyz.utils.wire()`<input type="text" placeholder="Pick from calendar." style="text-align: end;">${entry.type === 'datetime' && _xyz.utils.formatDateTime(entry.value) || _xyz.utils.formatDate(entry.value) || ''}`;

  const input = _input.childNodes[0];

  input.value = entry.type === 'datetime' && _xyz.utils.formatDateTime(entry.value) || _xyz.utils.formatDate(entry.value) || '';

  entry.val.appendChild(input);

  _xyz.utils.flatpickr({
    value: entry.value ? new Date(entry.value*1000).toISOString() : '',
    element: input,
    enableTime: entry.type === 'datetime' ? true : false,
    callback: dateStr => {

      input.value = dateStr;
      
      const date_unix = _xyz.utils.meltDateStr(dateStr);

      entry.location.view.dispatchEvent(
        new CustomEvent('valChange', {detail:{
          input: input,
          entry: entry,
          newValue: date_unix
        }}));
    }
  });

};