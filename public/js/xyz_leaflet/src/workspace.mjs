export default _xyz => {

  return {
    fetchWS: fetchWS,
    setWS: setWS,
    loadLocale: loadLocale
  };

  async function fetchWS() { 

    const promise = await fetch(_xyz.host + '/workspace/get?token=' + _xyz.token);

    // Assign workspace.
    const workspace = await promise.json();

    // Filter invalid locales
    _xyz.workspace.locales = Object.keys(workspace.locales)
      .filter(key => key.indexOf('__') === -1)
      .reduce((obj, key) => {
        obj[key] = workspace.locales[key];
        return obj;
      }, {});

  };

  function setWS(params) {

    // XHR to retrieve workspace from host backend.
    const xhr = new XMLHttpRequest();

    xhr.open('GET', _xyz.host + '/workspace/get?token=' + _xyz.token);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';
    xhr.onload = e => {

      if (e.target.status !== 200) return console.error('Failed to retrieve workspace from XYZ host!');

      // Assign workspace.
      const workspace = e.target.response;

      // Filter invalid locales
      _xyz.workspace.locales = Object.keys(workspace.locales)
        .filter(key => key.indexOf('__') === -1)
        .reduce((obj, key) => {
          obj[key] = workspace.locales[key];
          return obj;
        }, {});


      //_xyz.workspace.loadLocale(params);

      params.callback(_xyz);

    };

    xhr.send();

  };

  function loadLocale(params) {

    // Set locale from 1. hook, 2. params, 3. first locale in workspace.
    const localeKey = _xyz.hooks.current.locale || params.locale || Object.keys(_xyz.workspace.locales)[0];

    _xyz.workspace.locale = Object.assign({}, _xyz.workspace.locales[localeKey], params);

    _xyz.workspace.locale.key = localeKey;

    // Filter invalid layers
    _xyz.layers.list = Object.keys(_xyz.workspace.locale.layers)
      .filter(key => key.indexOf('__') === -1)
      .reduce((obj, key) => {
        obj[key] = _xyz.workspace.locale.layers[key];
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
    });

  };

};