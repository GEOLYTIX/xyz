import _xyz from '../../../_xyz.mjs';

export default (layer, options) => {

  function oninput(e) {
    let val = parseFloat(e.target.value);
    if (!layer.filter[options.field]) layer.filter[options.field] = {};
    if (typeof (val) == 'number') {
      layer.filter[options.field][e.target.name] = val;
    } else {
      layer.filter[options.field][e.target.name] = null;
    }
    //console.log(layer.filter);
    //layer.get();
  }
  
  function onchange() {
    //console.log(layer.filter);
    layer.get();
  }
  
  let tl = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'range-tooltip _min',
      textContent: 'Min ' + options.min,
      name: 'gt'
    },
    appendTo: options.appendTo
  });
  
  let range_div = _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'range'
    },
    appendTo: options.appendTo
  });
  
  let range = _xyz.utils.createElement({
    tag: 'input',
    options: {
      type: 'range',
      min: options.min,
      max: options.max,
      value: options.min,
      name: 'gt',
      oninput: e => {
        tl.textContent = 'Min ' + e.target.value;
        oninput(e);
      },
      onchange: e => onchange(e)
    },
    appendTo: range_div
  });
  
  let tl2 = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'range-tooltip _max',
      textContent: 'Max ' + options.max
    },
    /*style: {
              float: 'right',
              margin-bottom: '5px'
          },*/
    appendTo: options.appendTo
  });
  
  let range_div2 = _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'range'
    },
    appendTo: options.appendTo
  });
  
  let range2 = _xyz.utils.createElement({
    tag: 'input',
    options: {
      type: 'range',
      min: options.min,
      max: options.max,
      value: options.max,
      name: 'lt',
      oninput: e => {
        tl2.textContent = 'Max ' + e.target.value;
        oninput(e);
      },
      onchange: e => onchange(e)
    },
    appendTo: range_div2
  });
};