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

      _xyz.mapview.create({
        locale: e.target.value,
        target: document.getElementById('Map'),
        scrollWheelZoom: true,
        btn: {
          ZoomIn: document.getElementById('btnZoomIn'),
          ZoomOut: document.getElementById('btnZoomOut'),
          Locate: document.getElementById('btnLocate')
        }
      });

      _xyz.tableview.create({
        target: document.getElementById('tableview'),
        btn: {
          toggleTableview: document.getElementById('toggleTableview')
        }
      });

      // Init layers listview.
      _xyz.layers.listview.init();
        
      // Init locations listview.
      _xyz.locations.listview.init();

      // Init gazetteer.
      _xyz.gazetteer.init();

    }
  });

};