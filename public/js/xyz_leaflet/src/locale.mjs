export default _xyz => {

  _xyz.loadLocale = params => {

    // Set locale from 1. hook, 2. params, 3. first locale in workspace.
    _xyz.locale = _xyz.hooks.current.locale || params.locale || Object.keys(_xyz.ws.locales)[0];

    const locale = Object.assign({}, _xyz.ws.locales[_xyz.locale], params);

    // Filter invalid layers
    _xyz.layers.list = Object.keys(locale.layers)
      .filter(key => key.indexOf('__') === -1)
      .reduce((obj, key) => {
        obj[key] = locale.layers[key];
        return obj;
      }, {});

    // Set the layer display from hooks then remove layer hooks.
    if (_xyz.hooks.current.layers) Object.keys(_xyz.layers.list).forEach(layer => {
      _xyz.layers.list[layer].display = (_xyz.hooks.current.layers.indexOf(encodeURIComponent(layer)) > -1);
    });

    if (_xyz.hooks.remove) _xyz.hooks.remove('layers');

    _xyz.panes.next = 500;
    _xyz.panes.list = [];

    Object.values(_xyz.layers.list).forEach(layer => {
      _xyz.layers.add(layer);
      // if (layer.display && layer.attribution) _xyz.attribution.set(layer.attribution);
    });

  };

};