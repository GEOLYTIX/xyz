export default _xyz => {

  _xyz.loadLocale = locale => {

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

    Object.values(_xyz.layers.list).forEach(layer => _xyz.layers.add(layer));

    _xyz.panes.list.push(_xyz.map.createPane('gazetteer'));
    _xyz.map.getPane('gazetteer').style.zIndex = _xyz.panes.next++;

    _xyz.panes.list.push(_xyz.map.createPane('select_display'));
    _xyz.map.getPane('select_display').style.zIndex = _xyz.panes.next++;

    _xyz.panes.list.push(_xyz.map.createPane('select'));
    _xyz.map.getPane('select').style.zIndex = _xyz.panes.next++;

    _xyz.panes.list.push(_xyz.map.createPane('select_marker'));
    _xyz.map.getPane('select_marker').style.zIndex = _xyz.panes.next++;

    _xyz.panes.list.push(_xyz.map.createPane('select_circle'));
    _xyz.map.getPane('select_circle').style.zIndex = _xyz.panes.next++;

    _xyz.panes.list.push(_xyz.map.createPane('drawing'));
    _xyz.map.getPane('drawing').style.zIndex = _xyz.panes.next++;

    _xyz.panes.list.push(_xyz.map.createPane('default'));
    _xyz.map.getPane('default').style.zIndex = _xyz.panes.next++;

  };

};