import create_block from './create_block.mjs';

export default (_xyz, layer, filter_entry) => {

  const block = create_block(_xyz, layer, filter_entry);

  // Label for min / greater then control.
  _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'range-label',
      textContent: 'After ',
    },
    appendTo: block
  });

  const input_min = _xyz.utils.createElement({
    tag: 'input',
    options: {
      classList: 'range-input',
      type: 'text',
      readonly: 'readonly'
    },
    appendTo: block
  });

  // separator container
  _xyz.utils.createElement({ 
    tag: 'div',
    appendTo: block,
    style: {
      width: '100%',
      height: '10px'
    }
  });

  _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'range-label',
      textContent: 'Before ',
    },
    appendTo: block
  });

  const input_max = _xyz.utils.createElement({
    tag: 'input',
    options: {
      classList: 'range-input',
      type: 'text',
      readonly: 'readonly'
    },
    appendTo: block
  });

  _xyz.utils.datePicker({
    element: input_min,
    position: 'c',
    formatter: (input, date) => {
          
      const meltDateStr = _xyz.utils.meltDateStr(new Date(date));

      input.value = filter_entry.type === 'datetime'?
        _xyz.utils.formatDateTime(meltDateStr):
        _xyz.utils.formatDate(meltDateStr);
  
    },
    onSelect: (instance, date) => {
      applyFilter();
      instance.calendar.style.top = '-10000px';
    },
    onShow: instance => {
   
      const yPosition = instance.el.getBoundingClientRect().top;

      instance.calendar.style.top = (yPosition - 100) + 'px';

    }
  });

  _xyz.utils.datePicker({
    element: input_max,
    position: 'c',
    formatter: (input, date) => {
          
      const meltDateStr = _xyz.utils.meltDateStr(new Date(date));

      input.value = filter_entry.type === 'datetime'?
        _xyz.utils.formatDateTime(meltDateStr):
        _xyz.utils.formatDate(meltDateStr);
  
    },
    onSelect: (instance, date) => {
      applyFilter();
      instance.calendar.style.top = '-10000px';
    },
    onShow: instance => {
   
      const yPosition = instance.el.getBoundingClientRect().top;

      instance.calendar.style.top = (yPosition - 100) + 'px';

    }
  });  

  let timeout;

  function applyFilter(){

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;

      // Create filter.
      layer.filter.current[filter_entry.field] = {};
      layer.filter.current[filter_entry.field].gt = _xyz.utils.meltDateStr(input_min.value) || null;
      layer.filter.current[filter_entry.field].lt = _xyz.utils.meltDateStr(input_max.value) || null;

      layer.filter.check_count();

      layer.show();

    }, 500);
  }
};