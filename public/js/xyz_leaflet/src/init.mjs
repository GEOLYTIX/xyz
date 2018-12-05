import _xyz from './_xyz.mjs';

export default params => {

  if (!params.map_id) return console.log('map_id missing in params.');

  _xyz.host = params.host;

  _xyz.map_dom = document.getElementById(params.map_id);

  _xyz.map = _xyz.L.map(params.map_id, {
    renderer: _xyz.L.svg(),
    scrollWheelZoom: true,
    zoomControl: false,
    attributionControl: false
  });

  _xyz.attribution.create();

  if (!params.host) return console.log('host missing in params.');

  _xyz.getWorkspace(init);

  function init() {

    if (!params.locale) return console.log('locale missing in params.');

    const locale = Object.assign({}, _xyz.ws.locales[params.locale], params);
  
    _xyz.map.setMinZoom(locale.minZoom);
    _xyz.map.setMaxZoom(locale.maxZoom);
  
    // Set Leaflet bounds;
    _xyz.map.setMaxBounds([[
      locale.bounds.south,
      locale.bounds.west
    ], [
      locale.bounds.north,
      locale.bounds.east
    ]]);
  
    _xyz.map.setView(locale.view_latlon || [0,0], locale.view_zoom || 5);
  
    // Fire viewChangeEnd after map move and zoomend
    _xyz.map.on('moveend', () => viewChangeEndTimer());
    _xyz.map.on('zoomend', () => viewChangeEndTimer());
  
    // Use timeout to prevent the viewChangeEvent to be executed multiple times.
    let timer;
    function viewChangeEndTimer() {
      clearTimeout(timer);
      timer = setTimeout(viewChangeEnd, 100);
    }
  
    function viewChangeEnd() {
  
      // Load layer which have display set to true.
      Object.values(_xyz.layers.list).forEach(layer => layer.get());
  
    }

    _xyz.loadLocale(locale);

    if (params.next) params.next();

  }

};