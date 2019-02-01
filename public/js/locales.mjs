export default _xyz => {

  _xyz.locales = locales => {

    // Return if length of locales array is 1.
    if (Object.keys(locales).length === 1) return;

    // Create control to change locale for multiple locales in workspace.
    const locale = document.getElementById('locale');

    // Create locales dropdown.
    _xyz.utils.dropdown({
      title: 'Show layers for the following locale:',
      appendTo: locale,
      entries: locales,
      label: 'name',
      val: 'loc',
      selected: _xyz.locale,
      onchange: e => {
  
        // Set the locale and remove hooks.
        _xyz.locale = e.target.value;

        _xyz.hooks.removeAll();
  
        _xyz.hooks.set('locale', _xyz.locale);

        _xyz.loadLocale({
          locale: _xyz.locale
        });

        _xyz.mapview.create({
          target: document.getElementById('Map'),
          scrollWheelZoom: true
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

};