import _xyz from './_xyz.mjs';

export default () => {

  // Set locale from hook or set first locale from locales array.
  _xyz.locale = _xyz.hooks.locale || Object.keys(_xyz.ws.locales)[0];

  // Set hook for locale if it doesn't exist.
  if (!_xyz.hooks.locale) _xyz.utils.setHook('locale', _xyz.locale);

  setLocaleDefaults();

  // Return if length of locales array is 1.
  if (Object.keys(_xyz.ws.locales).length === 1) return;

  // Create control to change locale for multiple locales in workspace.
  let locale = document.getElementById('locale');

  // Create locales dropdown.
  _xyz.utils.dropdown({
    title: 'Show layers for the following locale:',
    appendTo: locale,
    entries: _xyz.ws.locales,
    label: 'name',
    val: 'loc',
    selected: _xyz.locale,
    onchange: e => {
      _xyz.locale = e.target.value;
      _xyz.utils.removeHooks();
      _xyz.utils.setHook('locale', _xyz.locale);

      setLocaleDefaults();

      _xyz.setView(true);
      
      _xyz.ws.gazetteer.init(true);

      _xyz.initLayers();
      
      _xyz.ws.select.resetModule();
    }
  });

  // Set locale defaults.
  function setLocaleDefaults() {

    // Set min/max zoom defaults.
    _xyz.ws.locales[_xyz.locale].minZoom = parseInt(_xyz.ws.locales[_xyz.locale].minZoom) || 0;
    _xyz.ws.locales[_xyz.locale].maxZoom = parseInt(_xyz.ws.locales[_xyz.locale].maxZoom) || 20;

    // Set default bounds.
    _xyz.ws.locales[_xyz.locale].bounds = _xyz.ws.locales[_xyz.locale].bounds || {};
    _xyz.ws.locales[_xyz.locale].bounds.south = parseFloat(_xyz.ws.locales[_xyz.locale].bounds.south) || -90;
    _xyz.ws.locales[_xyz.locale].bounds.west = parseFloat(_xyz.ws.locales[_xyz.locale].bounds.west) || -180;
    _xyz.ws.locales[_xyz.locale].bounds.north = parseFloat(_xyz.ws.locales[_xyz.locale].bounds.north) || 90;
    _xyz.ws.locales[_xyz.locale].bounds.east = parseFloat(_xyz.ws.locales[_xyz.locale].bounds.east) || 180;

    // Formated bounds for leaflet.
    _xyz.ws.locales[_xyz.locale].bounds.leaflet = [[
      _xyz.ws.locales[_xyz.locale].bounds.south,
      _xyz.ws.locales[_xyz.locale].bounds.west
    ], [
      _xyz.ws.locales[_xyz.locale].bounds.north,
      _xyz.ws.locales[_xyz.locale].bounds.east
    ]];
  }
};