export default _xyz => {

  return {
    fetchLocales: fetchLocales,
    getLocales: getLocales,
  };

  async function fetchLocales() {

    const promise = await fetch(
      _xyz.host +
      '/api/workspace/get/locales?' +
      _xyz.utils.paramString({
        token: _xyz.token
      }));

    _xyz.workspace.locales = await promise.json();
  };

  function getLocales(callback) {

    // XHR to retrieve workspace from host backend.
    const xhr = new XMLHttpRequest();

    xhr.open('GET', _xyz.host + '/api/workspace/get/locales?' + _xyz.utils.paramString({
      token: _xyz.token
    }));
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';
    xhr.onload = e => {

      if (e.target.status !== 200) return console.error('Failed to retrieve workspace from XYZ host!');

      _xyz.workspace.locales = e.target.response;

      loadLocale(callback);
    };

    xhr.send();
  };

  function loadLocale(callback) {

    _xyz.locale = _xyz.locale || (_xyz.hooks && _xyz.hooks.current.locale) || _xyz.workspace.locales[0];

    // XHR to retrieve workspace from host backend.
    const xhr = new XMLHttpRequest();

    xhr.open('GET', _xyz.host + '/api/workspace/get/locale?' + _xyz.utils.paramString({
      locale: _xyz.locale,
      token: _xyz.token
    }));
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';
    xhr.onload = e => {

      if (e.target.status !== 200) return console.error('Failed to retrieve workspace from XYZ host!');

      _xyz.workspace.locale = Object.assign({ key: _xyz.locale }, e.target.response);

      Object.keys(_xyz.workspace.locale.layers)
      .filter(key => key.indexOf('__') === -1)
      .forEach(key => {
        _xyz.layers.list[key] = _xyz.layers.decorate(_xyz.workspace.locale.layers[key]);
      });
  
      callback && callback(_xyz);
    };

    xhr.send();

  };

};