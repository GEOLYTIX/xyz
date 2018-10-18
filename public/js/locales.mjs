import _xyz from './_xyz.mjs';

export default () => {

  // Set locale from hook or set first locale from locales array.
  _xyz.locale = _xyz.hooks.current.locale || Object.keys(_xyz.ws.locales)[0];

  // Set hook for locale if it doesn't exist.
  if (!_xyz.hooks.current.locale) _xyz.hooks.set('locale', _xyz.locale);

  // Filter invalid locales
  _xyz.ws.locales = Object.keys(_xyz.ws.locales)
    .filter(key => key.indexOf('__') === -1)
    .reduce((obj, key) => {
      obj[key] = _xyz.ws.locales[key];
      return obj;
    }, {});

  // Set Leaflet bounds;
  Object.values(_xyz.ws.locales).forEach(locale => {
    locale.bounds.leaflet = [[
      locale.bounds.south,
      locale.bounds.west
    ], [
      locale.bounds.north,
      locale.bounds.east
    ]];
  });

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

      _xyz.map.remove();

      _xyz.map = _xyz.initMap();

      // Set the locale and remove hooks.
      _xyz.locale = e.target.value;
      _xyz.hooks.removeAll();
      _xyz.hooks.set('locale', _xyz.locale);

      // Set drawing panes.
      _xyz.panes.init();

      // Set locale view.
      _xyz.view.set(true);
      
      // Init gazetteer.
      _xyz.gazetteer.init();

      // Init layers.
      _xyz.layers.init();
      
      // Init locations.
      _xyz.locations.init();
    }
  });

};