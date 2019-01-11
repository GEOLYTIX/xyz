export default _xyz => {

  _xyz.init = params => {

    // Set XYZ Host.
    _xyz.host = params.host;

    if (!_xyz.host) return console.error('XYZ host not defined!');

    if (params.token) _xyz.token = params.token;

    _xyz.assignBtn(params);

    // Get workspace from XYZ host.
    // Proceed with init from callback.
    _xyz.getWorkspace(init);

    function init(){

      // Set XYZ map DOM.
      _xyz.map_dom = document.getElementById(params.map_id);

      if (!_xyz.map_dom) return console.error('XYZ map not defined!');

      // Create attribution in map DOM.
      _xyz.attribution.create();

      // Remove existing Leaflet map object.
      if (_xyz.map) _xyz.map.remove();

      // Create Leaflet map object.
      _xyz.map = _xyz.L.map(_xyz.map_dom, {
        renderer: _xyz.L.svg(),
        scrollWheelZoom: params.scrollWheelZoom || false,
        zoomControl: false,
        attributionControl: false
      });

      // Set locale from params or to first in workspace.
      _xyz.locale = _xyz.hooks.current.locale || params.locale || Object.keys(_xyz.ws.locales)[0];

      // Set locale hook.
      if (_xyz.hooks.set) _xyz.hooks.set('locale', _xyz.locale);

      // Assign params to locale.
      // This makes it possible to override client side workspace entries.
      const locale = Object.assign({}, _xyz.ws.locales[_xyz.locale], params);
  
      // Set min, max zoom and bounds.
      _xyz.map.setMinZoom(locale.minZoom);
      _xyz.map.setMaxZoom(locale.maxZoom);
      _xyz.map.setMaxBounds([[
        locale.bounds.south,
        locale.bounds.west
      ], [
        locale.bounds.north,
        locale.bounds.east
      ]]);
  
      // Set view if defined in workspace.
      _xyz.map.setView(
        [
          _xyz.hooks.current.lat
        || locale.view_lat
        || 0,
          _xyz.hooks.current.lng
        || locale.view_lng
        || 0
        ],
        _xyz.hooks.current.z
      || locale.view_zoom
      || 5);
  
      // Fire viewChangeEnd after map move and zoomend
      _xyz.map.on('moveend', () => viewChangeEndTimer());
      _xyz.map.on('zoomend', () => viewChangeEndTimer());
  
      // Use timeout to prevent the viewChangeEvent to be executed multiple times.
      let timer;
      function viewChangeEndTimer() {
        clearTimeout(timer);
        timer = setTimeout(viewChangeEnd, 500);
      }
  
      function viewChangeEnd() {

      // Check whether zoom buttons should be disabled for initial view.
        if (_xyz.view.chkZoomBtn) _xyz.view.chkZoomBtn(_xyz.map.getZoom());

        // Set view hooks when method is available.
        if (_xyz.hooks.setView) _xyz.hooks.setView(_xyz.map.getCenter(), _xyz.map.getZoom());
  
        // Reload layers.
        // layer.get() will return if reload is not required.
        Object.values(_xyz.layers.list).forEach(layer => layer.get());
  
      }

      // Load locale.
      _xyz.loadLocale(locale);

      // Continue with callback if provided.
      if (params.callback) params.callback(_xyz);

    };

  };

};