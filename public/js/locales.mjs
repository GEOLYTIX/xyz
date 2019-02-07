export default _xyz => {

  // Return if length of locales array is 1.
  if (Object.keys(_xyz.workspace.locales).length === 1) return;

  // Create control to change locale for multiple locales in workspace.
  const localeDropdown = document.getElementById('localeDropdown');

  // Create locales dropdown.
  _xyz.utils.dropdown({
    title: 'Show layers for the following locale:',
    appendTo: localeDropdown,
    entries: _xyz.workspace.locales,
    label: 'name',
    val: 'loc',
    selected: _xyz.workspace.locale.key,
    onchange: e => {
  
      _xyz.hooks.removeAll();
  
      _xyz.hooks.set('locale', e.target.value);

      _xyz.workspace.loadLocale({
        locale: e.target.value
      });

      _xyz.mapview.create({
        target: document.getElementById('Map'),
        scrollWheelZoom: true,
        btn: {
          ZoomIn: document.getElementById('btnZoomIn'),
          ZoomOut: document.getElementById('btnZoomOut'),
          Locate: document.getElementById('btnLocate')
        }
      });

      // Init layers.
      _xyz.layers.init();
        
      // Init locations.
      _xyz.locations.init();

      // Init gazetteer.
      _xyz.gazetteer.init();

      // Init tableview
      _xyz.tableview.init();

    }
  });

};