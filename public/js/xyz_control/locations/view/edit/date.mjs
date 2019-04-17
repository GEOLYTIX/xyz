export default _xyz => entry => {

  entry.value = entry.type === 'datetime'?
    _xyz.utils.formatDateTime(entry.value):
    _xyz.utils.formatDate(entry.value);

  const input = _xyz.utils.createElement({
    tag: 'input',
    options: {
      value: entry.value || '',
      type: 'text'
    },
    appendTo: entry.val,
  });

  _xyz.utils.datePicker({
    element: input,
    position: 'c',
    formatter: (input, date) => {
          
      const meltDateStr = _xyz.utils.meltDateStr(new Date(date));

      input.value = entry.type === 'datetime'?
        _xyz.utils.formatDateTime(meltDateStr):
        _xyz.utils.formatDate(meltDateStr);
  
    },
    onSelect: (instance, date) => {

      entry.location.view.valChange({
        input: input,
        entry: entry,
        value: _xyz.utils.meltDateStr(new Date(input.value))});

      instance.calendar.style.top = '-10000px';
    },
    onShow: instance => {
   
      const yPosition = instance.el.getBoundingClientRect().top;

      instance.calendar.style.top = (yPosition - 100) + 'px';

    }
  });


};