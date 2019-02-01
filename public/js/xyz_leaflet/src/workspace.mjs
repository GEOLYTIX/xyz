export default _xyz => {

  _xyz.fetchWorkspace = async () => { 

    const promise = await fetch(_xyz.host + '/workspace/get?token=' + _xyz.token);

    const ws = await promise.json();

    // Filter invalid locales
    ws.locales = Object.keys(ws.locales)
      .filter(key => key.indexOf('__') === -1)
      .reduce((obj, key) => {
        obj[key] = ws.locales[key];
        return obj;
      }, {});

    return ws;

  };

  _xyz.setWorkspace = done => {

    // XHR to retrieve workspace from host backend.
    const xhr = new XMLHttpRequest();
    xhr.open('GET', _xyz.host + '/workspace/get?token=' + _xyz.token);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';
    xhr.onload = e => {

      if (e.target.status !== 200) return console.error('Failed to retrieve workspace from XYZ host!');

      // Assign workspace to __xyz.
      _xyz.ws = e.target.response;

      // Filter invalid locales
      _xyz.ws.locales = Object.keys(_xyz.ws.locales)
        .filter(key => key.indexOf('__') === -1)
        .reduce((obj, key) => {
          obj[key] = _xyz.ws.locales[key];
          return obj;
        }, {});

      done();

    };

    xhr.send();

  };

};