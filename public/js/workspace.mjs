export default _xyz => {

  return {
    fetchWS: fetchWS,
    setWS: setWS,
    loadLocale: loadLocale
  };

  async function fetchWS() { 

    const promise = await fetch(_xyz.host + '/workspace/get?' + _xyz.utils.paramString({
      token: _xyz.token
    }));

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

    xhr.open('GET', _xyz.host + '/workspace/get?' + _xyz.utils.paramString({
      token: _xyz.token
    }));
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

      loadLocale(params);

      params.callback(_xyz);

    };

    xhr.send();

  };

  function loadLocale(params) {

    // Set locale from params or first locale in workspace.
    const localeKey = params.locale || Object.keys(_xyz.workspace.locales)[0];

    _xyz.workspace.locale = { key: localeKey };

    Object.assign(_xyz.workspace.locale, _xyz.workspace.locales[localeKey], params);

    // Create layers list.
    _xyz.layers.list = {};
    
    // Filter invalid layers.
    Object.keys(_xyz.workspace.locale.layers)
      .filter(key => key.indexOf('__') === -1)

      // Create layer objects.
      .forEach(key => _xyz.layers.list[key] = _xyz.layers.layer(key));

  };

};