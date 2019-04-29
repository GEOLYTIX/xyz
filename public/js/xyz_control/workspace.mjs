export default _xyz => {

  return {
    fetchWS: fetchWS,
    setWS: setWS,
    loadLocale: loadLocale,
    admin: admin,
  };

  function filterLocales(locales) {

    return Object.keys(locales)
      .filter(key => key.indexOf('__') === -1)
      .reduce((obj, key) => {
        obj[key] = locales[key];
        return obj;
      }, {});

  }

  async function fetchWS() { 

    const promise = await fetch(
      _xyz.host +
      '/workspace/get?' +
      _xyz.utils.paramString({
        token: _xyz.token
      }));

    // Assign workspace.
    const workspace = await promise.json();

    // Filter invalid locales
    _xyz.workspace.locales = filterLocales(workspace.locales);

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
      _xyz.workspace.locales = filterLocales(workspace.locales);

      if (params.locale) loadLocale(params);

      if (params.callback) params.callback(_xyz);

    };

    xhr.send();

  };

  function loadLocale(params = {}) {

    params.locale = (_xyz.workspace.locales[params.locale] && params.locale) || Object.keys(_xyz.workspace.locales)[0];

    _xyz.workspace.locale = { key: params.locale };

    Object.assign(_xyz.workspace.locale, _xyz.workspace.locales[params.locale], params);

    // Create layers list.
    _xyz.layers.list = {};
    
    // Filter invalid layers.
    Object.keys(_xyz.workspace.locale.layers)
      .filter(key => key.indexOf('__') === -1)

      // Create layer objects.
      .forEach(key => _xyz.layers.list[key] = _xyz.layers.layer(key));

  };

  function admin(){

    const workspace = document.getElementById('workspace');

    workspace.style.display = 'block';

    const btnCloseWS = document.getElementById('btnCloseWS');

    btnCloseWS.onclick = () => {
      workspace.style.display = 'none';
      document.getElementById('codemirror').innerHTML = '';
    };

    const codeMirror = CodeMirror(document.getElementById('codemirror'), {
      value: '{}',
      lineNumbers: true,
      mode: 'application/json',
      gutters: ['CodeMirror-lint-markers'],
      lint: true,
      lineWrapping: true,
      autofocus: true,
    });
    
    
    const fileInput = document.getElementById('fileInputWS');
    
    fileInput.addEventListener('change', function () {
    
      let reader = new FileReader();
      reader.onload = function () {
        try {
          fileInput.value = null;
          codeMirror.setValue(this.result);
          codeMirror.refresh();
    
        } catch (err) {
          alert('Failed to parse JSON');
        }
      };
      reader.readAsText(this.files[0]);
    
    });


    const btnFile = document.getElementById('btnFileWS');
    
    btnFile.onclick = () => fileInput.click();
    
    
    const btnUpload = document.getElementById('btnUploadWS');
    
    btnUpload.onclick = () => {
    
      const xhr = new XMLHttpRequest();
      xhr.open('POST', document.head.dataset.dir + '/workspace/check?token=' + document.body.dataset.token);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.responseType = 'json';
      xhr.onload = e => {

        if (e.target.status !== 200) alert('I am not here. This is not happening.');

        if (confirm(e.target.response.join('\r\n'))) {

          const xhr = new XMLHttpRequest();
          xhr.open('POST', document.head.dataset.dir + '/workspace/set?token=' + document.body.dataset.token);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.responseType = 'json';
          xhr.onload = e => {
    
            if (e.target.status !== 200) alert('I am not here. This is not happening.');

            const locale = _xyz.hooks.current.locale;

            setWS({locale : locale,
              callback: ()=> {
                _xyz.hooks.removeAll();
  
                _xyz.hooks.set({locale : locale});
    
                _xyz.workspace.loadLocale({ locale: locale });
  
                _xyz.desktop.mask.style.display = 'none';
              }});
          };

          xhr.send(JSON.stringify({ settings: codeMirror.getValue() }));

        } else {

          _xyz.desktop.mask.style.display = 'none';

        }
    
      };

      _xyz.utils.hyperHTML.bind(_xyz.desktop.mask)`<p class="msg">Updating Workspace</p>`;
    
      _xyz.desktop.mask.style.display = 'block';
       
      xhr.send(JSON.stringify({ settings: codeMirror.getValue() }));
      
    };
    

    // Load workspace in codemirror.
    const xhr = new XMLHttpRequest();
    xhr.open('GET', document.head.dataset.dir + '/workspace/get?token=' + document.body.dataset.token);
    xhr.responseType = 'json';
    xhr.onload = e => {
      codeMirror.setValue(JSON.stringify(e.target.response, null, '  '));
      codeMirror.refresh();
    };
    xhr.send();

  }

};