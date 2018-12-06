import _xyz from '../../_xyz.mjs';

export default (function(){

  _xyz.loadLocale = locale => {

    // // Filter invalid layers
    // _xyz.layers.list = Object.keys(_xyz.layers.list)
    //   .filter(key => key.indexOf('__') === -1)
    //   .reduce((obj, key) => {
    //     obj[key] = _xyz.layers.list[key];
    //     return obj;
    //   }, {});

    _xyz.layers.list = {};

    Object.values(locale.layers).forEach(layer => {

      if (layer.style && layer.style.themes) layer.style.theme = Object.values(layer.style.themes)[0];
    
      _xyz.layers.add(layer);
    });

  };

})();