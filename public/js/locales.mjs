export default _xyz => {

  _xyz.workspace.loadLocale = _xyz.utils.compose(
    _xyz.workspace.loadLocale,
    () => {

      _xyz.hooks.set({locale : _xyz.workspace.locale.key});

      // Create mapview control.
      _xyz.mapview.create({
        target: document.getElementById('Map'),
        view: {
          lat: _xyz.hooks.current.lat,
          lng: _xyz.hooks.current.lng,
          z: _xyz.hooks.current.z
        },
        scrollWheelZoom: true,
        btn: {
          ZoomIn: document.getElementById('btnZoomIn'),
          ZoomOut: document.getElementById('btnZoomOut'),
          Locate: document.getElementById('btnLocate'),
        }
      });

      // Create tableview control.
      _xyz.tableview.create({
        target: document.getElementById('tableview'),
        btn: {
          toggleTableview: document.getElementById('toggleTableview'),
          tableViewport: document.getElementById('btnTableViewport')
        }
      });

      _xyz.layers.listview.init(document.getElementById('layers'));

      _xyz.locations.listview.init();

      _xyz.gazetteer.init();

    }
  );

  _xyz.workspace.loadLocale({ locale: _xyz.hooks.current.locale });

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
  
      _xyz.hooks.set({locale : e.target.value});

      _xyz.workspace.loadLocale({ locale: _xyz.hooks.current.locale });

    }
  });

};