import _xyz from '../../../_xyz.mjs';

export default (layer, options) => {

  // default date strings
  let def = {
    dd: '01',
    mm: '01',
    df: []
  };
  
  def.df[1] = def.mm;
  def.df[2] = def.dd;
  
  function date_to_string(arr) {
    return '\'' + arr.join('-') + '\'';
  }
  
  function show_reset() {
    let siblings = options.appendTo.children;
    for (let sibling of siblings) {
      if (sibling.tagName === 'DIV' && sibling.classList.contains('btn_small')) {
        sibling.style.display = 'block';
      }
    }
  }
  
  // sql and keyups
  
  function onkeyup(e, format) {
    let val = parseInt(e.target.value);
    if (e.target.value) show_reset();
  
    switch (format) {
    case 'dd':
      if (val && val > 0 && val < 32) {
        if (val < 10) val = '0' + String(val);
        def.df[2] = val;
        if (def.df[0]) layer.filter[options.field][e.target.name] = date_to_string(def.df);
      } else {
        def.df[2] = def[format];
      } break;
  
    case 'mm':
      if (val && val > 0 && val < 13) {
        if (val < 10) val = '0' + String(val);
        def.df[1] = val;
        if (def.df[0]) layer.filter[options.field][e.target.name] = date_to_string(def.df);
      } else {
        def.df[1] = def[format];
      } break;
  
    case 'yyyy':
      if (!layer.filter[options.field]) layer.filter[options.field] = {};
      if (val && val > 99) {
        def.df[0] = val;
        layer.filter[options.field][e.target.name] = date_to_string(def.df);
      } else {
        def.df[0] = null;
        layer.filter[options.field] = {};
      } break;
    }
    layer.get();
  }
  
  // labels
  // later than label
  _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'label half',
      textContent: 'later than'
    },
    appendTo: options.appendTo
  });
  
  // earlier than label
  _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'label half right',
      textContent: 'earlier than'
    },
    appendTo: options.appendTo
  });
  
  // later than year input
  _xyz.utils.createElement({
    tag: 'input',
    options: {
      classList: 'label third',
      placeholder: 'yyyy',
      name: 'gte'
    },
    eventListener: {
      event: 'keyup',
      funct: e => onkeyup(e, 'yyyy')
    },
    appendTo: options.appendTo
  });
  
  // later than month input
  _xyz.utils.createElement({
    tag: 'input',
    options: {
      classList: 'label third',
      placeholder: 'mm'
    },
    eventListener: {
      event: 'keyup',
      funct: e => onkeyup(e, 'mm')
    },
    appendTo: options.appendTo
  });
  
  // later than day input
  _xyz.utils.createElement({
    tag: 'input',
    options: {
      classList: 'label third',
      placeholder: 'dd'
    },
    eventListener: {
      event: 'keyup',
      funct: e => onkeyup(e, 'dd')
    },
    appendTo: options.appendTo
  });
  
  // earlier than day input
  _xyz.utils.createElement({
    tag: 'input',
    options: {
      classList: 'label third right',
      placeholder: 'dd'
    },
    eventListener: {
      event: 'keyup',
      funct: e => onkeyup(e, 'dd')
    },
    appendTo: options.appendTo
  });
  
  // earlier than month input
  _xyz.utils.createElement({
    tag: 'input',
    options: {
      classList: 'label third right',
      placeholder: 'mm'
    },
    eventListener: {
      event: 'keyup',
      funct: e => onkeyup(e, 'mm')
    },
    appendTo: options.appendTo
  });
  
  // earlier than year input
  _xyz.utils.createElement({
    tag: 'input',
    options: {
      classList: 'label third right',
      placeholder: 'yyyy',
      name: 'lte'
    },
    eventListener: {
      event: 'keyup',
      funct: e => onkeyup(e, 'yyyy')
    },
    appendTo: options.appendTo
  });
  
  _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'btn_small cursor noselect',
      textContent: 'Reset'
    },
    eventListener: {
      event: 'click',
      funct: e => {
        let siblings = options.appendTo.children;
        for (let sibling of siblings) {
          if (sibling.tagName === 'INPUT') sibling.value = '';
        }
        e.target.style.display = 'none';
        layer.filter[options.field] = {};
        layer.get();
      }
    },
    appendTo: options.appendTo
  });
};