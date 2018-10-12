import _xyz from '../../../_xyz.mjs';

export default (layer, _options) => {

  function onkeyup() {
    let val = this.value;
    if (!layer.filter[_options.field]) layer.filter[_options.field] = {};
    layer.filter[_options.field][this.name] = val;
    layer.get();
  }
  
  _xyz.utils.createElement({
    tag: 'input',
    options: {
      placeholder: 'Search.',
      onkeyup: onkeyup,
      name: _options.operator
    },
    appendTo: _options.appendTo
  });
};