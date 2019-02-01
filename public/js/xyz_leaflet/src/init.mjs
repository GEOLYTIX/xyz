export default _xyz => {

  _xyz.init = async params => {

    // Set XYZ Host.
    _xyz.host = params.host;

    if (!_xyz.host) return console.error('XYZ host not defined!');

    if (params.token) _xyz.token = params.token;

    _xyz.assignBtn(params);

    // Get workspace from XYZ host.
    // Proceed with init from callback.
    if (params.callback) return _xyz.setWorkspace(init);

    // Fetch workspace if no callback is provided.
    _xyz.ws = await _xyz.fetchWorkspace();

    init();

    return _xyz;


    function init(){

      _xyz.locale = _xyz.hooks.current.locale || params.locale || Object.keys(_xyz.ws.locales)[0];

      const locale = Object.assign({}, _xyz.ws.locales[_xyz.locale], params);

      _xyz.loadLocale(locale);

      if (params.callback) params.callback(_xyz);

    }

  };

};