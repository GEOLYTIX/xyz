import _xyz from '../../../_xyz.mjs';

export default (layer, options) => {

  function onkeyup() {
    let val = parseFloat(this.value);
  
    if (!layer.filter[options.field]) layer.filter[options.field] = {};
  
    if (typeof (val) == 'number') {
      layer.filter[options.field][this.name] = val;
    } else {
      layer.filter[options.field][this.name] = null;
    }
  
    layer.get();
  }
  
  _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'label half',
      textContent: '> greater than'
    },
    appendTo: options.appendTo
  });
  
  _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'label half right',
      textContent: '< less than'
    },
    appendTo: options.appendTo
  });
  
  _xyz.utils.createElement({
    tag: 'input',
    options: {
      className: 'label half',
      placeholder: 'Set value.',
      name: 'gt',
      onkeyup: onkeyup
    },
    appendTo: options.appendTo
  });
  
  _xyz.utils.createElement({
    tag: 'input',
    options: {
      className: 'label half right',
      placeholder: 'Set value.',
      onkeyup: onkeyup,
      name: 'lt'
    },
    appendTo: options.appendTo
  });
};